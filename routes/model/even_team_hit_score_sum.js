
/**
 * * 각 팀별 시수합계를 균일하게 조정한다.(메인 프로세스)
 * @param {*} gnum 
 * @param {*} team_count 
 */
class EvenTeamHitScoreSum {

    constructor(sqliteSync) {
        this.sqliteSync = sqliteSync;
    }

    async run(gnum, team_count) {

        // 팀원을 교체할 때 허용가능 시수차이값
        let compareOffsetValue = 1;
    
        //팀별 최소 시수합계를 추출한다.
        let selectMinGakgungCnt = "select min(gakgung_count) min_cnt, max(gakgung_count) max_cnt from team_jakdae_status";
    
        for (let i = 0; i < 10; i++) {
            let gakgungCntByTeam = await this.sqliteSync.get(selectMinGakgungCnt, []);
            console.log(`${i}th evenGakgungCount ... 최소/최대/허용점수차 : ${gakgungCntByTeam.min_cnt}/${gakgungCntByTeam.max_cnt}/${compareOffsetValue}`);
           
            let processedCnt = await this.evenGakgungCount(gnum, team_count, gakgungCntByTeam.min_cnt, compareOffsetValue);
            if(processedCnt == 0 && processedCnt < 3)
                compareOffsetValue++;
    
            if(gakgungCntByTeam.min_cnt > gakgungCntByTeam.max_cnt - 2) {
                return;
            }
        }
    
    }
    
    
    /**
     * 각 팀별 각궁수를 균일하게 조정한다.(단위 프로세스)
     * @param {*} gnum 
     * @param {*} team_count 
     */
    async evenGakgungCount(gnum, team_count, min_gakgung_count, compare_score_offset) {
    
        let workSuccessCnt = 0;
    
        // 각궁수가 최소 각궁수보다 2개 이상인 팀목록을 추출한다.
        let selectTeamHasMoreGakgung =  
              "select team_num " 
            + "from team_jakdae_status " 
            + "where gakgung_count > (:1 + 1) " 
            + "order by gakgung_count desc ";
        let TeamListHasMoreGakgung = await this.sqliteSync.all(selectTeamHasMoreGakgung, [min_gakgung_count]);
    
        for (let i = 0; i < TeamListHasMoreGakgung.length; i++) {
    
            let team_num = TeamListHasMoreGakgung[i].team_num;
            let selectSqlGakgungPlayers
                = " select j.team_num, j.mid, (s.round1_hits + s.round2_hits + s.round3_hits ) score " 
                + "   from monthly_game_team_jakdae j, monthly_game_personal_score s " 
                + "  where j.gnum = :gnum " 
                + "    and j.team_num = :team_num " 
                + "    and j.gnum = s.gnum " 
                + "    and j.mid = s.mid " 
                + "    and s.gakgung = 1 " 
                + "    and s.apply_team_game > 0 "
                + "    and j.upt_number > :total_team_count ";
            let gakgungPlayers = await this.sqliteSync.all(selectSqlGakgungPlayers, [gnum, team_num, team_count]);
    
            let isSuccess = await this.searchChangeGakgungPlayer(gnum, team_count, min_gakgung_count, gakgungPlayers, compare_score_offset);
            if(isSuccess)
                workSuccessCnt++;
            
        }
        return workSuccessCnt;
    }
    
    
    /**
     * 각궁수가 많은 팀원의 각궁선수를 각궁수가 적은팀의 팀원과 교체할 선수를 찾는다.
     * @param {*} gnum 
     * @param {*} team_count 
     * @param {*} gakgung_min_cnt 
     * @param {*} gakgungPlayers 
     */
    async searchChangeGakgungPlayer(gnum, team_count, gakgung_min_cnt, gakgungPlayers, compare_score_offset) {
    
        let selectSqlNonGakgungPlayer 
            = " select mid, team_num "
            + "   from monthly_game_team_jakdae "
            + "  where gnum = :gnum "
            + "    and team_num in ( "
            + "        select team_num "
            + "          from team_jakdae_status "
            + "         where gakgung_count = :gakgung_min_cnt "
            + "        ) "
            + "    and mid in ( "
            + "          select mid "
            + "            from monthly_game_personal_score "
            + "           where gnum = :gnum "
            + "             and (round1_hits + round2_hits + round3_hits) between :low_score and :high_score "
            + "             and gakgung = 0 "
            + "             and apply_team_game > 0 "
            + "         ) "
            + "     and upt_number > :apply_num ";
    
    
        for (let i = 0; i < gakgungPlayers.length; i++) {
    
            let changePlayer = await this.sqliteSync.get(selectSqlNonGakgungPlayer, [gnum, gakgung_min_cnt, gakgungPlayers[i].score - compare_score_offset, gakgungPlayers[i].score + compare_score_offset, team_count]);
            if(changePlayer) {
                console.log(`${gakgungPlayers[i].team_num}/${gakgungPlayers[i].mid} <--> ${changePlayer.team_num}/${changePlayer.mid}`)
                return await this.changeGakgungPlayer(gnum, gakgungPlayers[i], changePlayer);
            }
        }
    
        return false;
    
    }
    
    /**
     * 각궁선수와 비각궁 선수를 교체한다.
     * @param {*} gnum 
     * @param {*} gakgungPlayer 
     * @param {*} changePlayer 
     */
    async changeGakgungPlayer(gnum, gakgungPlayer, changePlayer) {
    
        let updateSqlChagePlayer
            = " update monthly_game_team_jakdae "
            + "    set team_num = :to_team_num "
            + "  where gnum = :gnum "
            + "    and team_num = :from_team_num "
            + "    and mid = :mid ";
    
        let updateTeamStatus 
            = " update team_jakdae_status"
            + "    set gakgung_count = gakgung_count + :num "
            + "  where team_num = :team_num ";
    
        // 각궁선수를 각궁선수가 없는 팀으로 변경한다.
        let ret1 = await this.sqliteSync.run(updateSqlChagePlayer, [changePlayer.team_num, gnum, gakgungPlayer.team_num, gakgungPlayer.mid]);
        if(ret1.changes > 0) {
    
            // 각궁선수가 있던 팀의 각궁수를 1차감한다.
            await this.sqliteSync.run(updateTeamStatus, [-1, gakgungPlayer.team_num]);
            // 개량궁선수가 있던 팀의 각궁수를 1더한다.
            await this.sqliteSync.run(updateTeamStatus, [1, changePlayer.team_num]);
            
            // 개량궁선수를 각궁선수가 있던 팀으로 변경한다.
            let ret2 = await this.sqliteSync.run(updateSqlChagePlayer, [gakgungPlayer.team_num, gnum, changePlayer.team_num, changePlayer.mid]);
            if(ret2.changes > 0) {
                return true;
            }
        }
    
        return false;
    }
    
}

module.exports = EvenTeamHitScoreSum;
