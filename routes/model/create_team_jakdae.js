/**
 * 정해진 기준에 맞춰 팀작대 생성하기
 * 
 * 작대생성기준
 * ------------------------------
 * 1. 1번사수 - 팔찌동/나이순
 * 2. 2번사수 - 팀별시수 균형을 맞추기 위해 1번 사수와 합계를 18시가 되도록 맞춘다.
 * 3. 3번사수 부터는 시수순으로 적용한다.
 */
class CreateTeamJakdae {

    /**
     * 생성자
     * @param {*} sqliteSync Promise Sqlite DB
     * @param {*} gnum 삭회회차
     * @param {*} team_count 적용팀수
     */
    constructor(sqliteSync, gnum, team_count) {
        this.sqliteSync = sqliteSync;
        this.gnum = gnum;
        this.team_count = team_count;
        this.init();
        this.process_status = true;
    }


    /**
     * 초기 설정값을 정의한다.
     */
    init() {

        this._applySeqNumber = 1;  // 작대적용순번
        this._procStepNumber = 1;  // 작대적용그룹순번
        this._currentMaxMemsByTeam = 1;  // 현재 팀별 각궁 최대인원
        
        // 나이 기준으로 3개 클래스(상,중,하)로 구분하여 작대에 초기 입력한다하
        // 단체전에서 팀별 연령대가 고르게 분포되도록 하기 위함.
        this.sqlInitJakdae 
            = " insert into monthly_game_team_jakdae (gnum, mid, shooting_priority, age_class) "
            + " select s.gnum, s.mid, shooting_priority "
            + "       ,ntile(2) over win age_class "
            + "   from monthly_game_personal_score s, members m "
            + "  where s.mid = m.mid "
            + "   and s.gnum = :1 "
            + "   and s.apply_team_game > 0 "
            + " window win as (order by shooting_priority, age desc) ";
        
        // 가상의 더미선수를 적용하는 쿼리문.
        this.insertSqlDummyPlayers 
            = " insert into monthly_game_personal_score(gnum, mid, round3_hits) "
            + " select gnum, 'dummy'||row_number() over () mid, :score "
            + "   from monthly_game_personal_score "
            + "  where gnum = :gnum "
            + "  limit :add_players ";

        
        // 각궁궁사를 조회한다.(팀별 인원을 적용하기 위해....)
        this.sqlSelectGakungMembers
            = " select s.gnum, s.mid, s.gakgung, (round1_hits + round2_hits + round3_hits) score, age, female "
            + " from monthly_game_personal_score s, monthly_game_team_jakdae j, members m "
            + " where s.mid = j.mid "
            + " and s.mid = m.mid "
            + " and s.gnum = :1 "
            + " and s.apply_team_game > 0 "
            + " and j.team_num is null "
            + " and s.gakgung = 1 "
            + " order by (round1_hits+round2_hits+round3_hits) desc, j.shooting_priority, age desc ";
        
        // 나이대/팔찌동/시수순으로 조회한다.(팀별 인원을 적용하기 위해....)
        this.sqlSelectOrderedMembers
            = " select s.gnum, s.mid, s.gakgung, (round1_hits + round2_hits + round3_hits) score, age, female "
            + " from monthly_game_personal_score s, monthly_game_team_jakdae j, members m "
            + " where s.mid = j.mid "
            + " and s.mid = m.mid "
            + " and s.gnum = :1 "
            + " and s.apply_team_game > 0 "
            + " and j.team_num is null "
            + " and (round1_hits + round2_hits + round3_hits) <= :2 "
            + " order by (round1_hits+round2_hits+round3_hits) desc, j.shooting_priority, age desc "
            + " limit :3 ";
            
        // 팀별 1번째 사수를 추출할 때 사용(나이대/팔찌동/나이 순)
        this.sqlOrderByAge  = " order by j.age_class, j.shooting_priority, age desc ";
        
        
        // 팀별 현재 속성값(인원수, 시수, 나이, 여무사인원, 각궁수)를 적용한다.
        this.sqlUpdateTeamStatus
            = " update team_jakdae_status "
            + "    set member_count = member_count + :1 " 
            + "       ,score_sum = score_sum + :2 " 
            + "       ,age_sum = age_sum + :3 " 
            + "       ,female_count = female_count + :4 "  
            + "       ,gakgung_count = gakgung_count + :5 "
            + "       ,advantage = advantage + :6 "
            + " where team_num = :7 ";
        
        
        // 전체팀 평균시수 대비 각 팀별 상대 비율값을 추출한다.
        this.sqlSelAvgPercentage
            = " select team_num, round(score_sum/avg_score*100) percent "
            + "   from team_jakdae_status s, ( "
            + "         select round(avg(score_sum)) avg_score"
            + "         from team_jakdae_status"
            + "        ) ";    
        
        
        // 작대에 적용된 인원의 팀번호를 업데이트 한다.    
        this.sqlUpdateJakdae
            = " update monthly_game_team_jakdae "
            + "    set team_num = :1 "
            + "       ,upt_number = :2 "
            + "       ,proc_step = :3 "
            + " where gnum = :4 "
            + " and mid = :5 ";
        
        
        // 현재 최소 시수합계를 가지는 1팀을 추출한다.
        this.sqlMinScoreTeam
            = " select team_num " 
            + " from team_jakdae_status "
            + " order by member_count, score_sum "
            + " limit 1 ";
        
        // 전체팀 목록을 추출한다.(어드밴티지 값이 놓은 순으로 )
        this.sqlSelectTeamList
            = " select team_num, advantage, score_sum, age_sum, gakgung_count, female_count " 
            + " from team_jakdae_status "
            + " order by score_sum ";

        // 평균시수를 구한다.(총시수/참가인원)
        this.selectSqlAvgScore
            = " select round(sum(round1_hits+round2_hits+round3_hits+0.0)/count(*)) avg_score "
            + "        ,(:team_count)-(count(*)%(:team_count)) add_player "
            + "        ,ifnull(count(*), 0) total_players "
            + " from monthly_game_personal_score " 
            + " where gnum = :gnum "
            + "   and apply_team_game > 0 "
            + "   and mid not like 'dummy%' ";

    }
    
    /**
     * 정해진 갯수의 팀을 생성한다. 
     */
    async createTeam() {
    
        if(!this.process_status){
            return;
        }
        console.log('createTeam ...');
    
        await this.sqliteSync.run('delete from monthly_game_team_jakdae where gnum = :1 ', [this.gnum]);
        await this.sqliteSync.run(this.sqlInitJakdae, [this.gnum]);
    
        await this.sqliteSync.run('delete from team_jakdae_status ');
    
        // 팀 개수 만큼 속성 초기값을 입력한다.
        for (let i = 0; i < this.team_count; i++) {
            await this.sqliteSync.run('insert into team_jakdae_status (team_num) values ('+(i+1)+') ');
        }
    }
    
    
    /**
     * 팀별 첫번째 사수를 지정한다.(팔찌동,나이순으로 적용한다.)
     */
    async applyFirstPlayer() {

        if(!this.process_status){
            return;
        }
    
        console.log('applyFirstPlayer ...');
        this._procStepNumber++;
    
        let sql = this.sqlSelectOrderedMembers.replace(/ order by .* desc /gi, this.sqlOrderByAge);
        let orderedResult = await this.sqliteSync.all(sql, [this.gnum, 15, this.team_count]);
    
        for (let i = 0; i < orderedResult.length; i++) {
           
            let element = orderedResult[i];
            let teamNum = (i+1);
            await this.sqliteSync.run(this.sqlUpdateJakdae, [teamNum, this._applySeqNumber++, this._procStepNumber, this.gnum, element.mid]);
            await this.sqliteSync.run(this.sqlUpdateTeamStatus, [1, element.score, element.age, element.female, element.gakgung, 0, teamNum]);
        }
    }
    
    
    /**
     * 팀별 2번째 사수를 적용한다.
     */
    async applySecondPlayer() {
    
        if(!this.process_status){
            return;
        }
        console.log('applySecondPlayer ....');
        this._procStepNumber++;
    
        let allTeams = await this.sqliteSync.all(this.sqlSelectTeamList, []);
        let teamNum = 0;
        let sqlMaxScoreMembers = this.sqlSelectOrderedMembers.replace(/ order by .* desc /gi, "order by (round1_hits+round2_hits+round3_hits) desc");
        
        for (let i = 0; i < allTeams.length; i++) {
            
            teamNum = allTeams[i].team_num;
            let limitScore = (15 - allTeams[i].score_sum);
            let element = new Object();

            let stat = true;
            while (limitScore <= 15 && stat) {
                element = await this.sqliteSync.get(sqlMaxScoreMembers, [this.gnum, limitScore, 1]);
                if(element && element.mid) {
                    stat = false;
                }
                limitScore++;
            }

            await this.sqliteSync.run(this.sqlUpdateJakdae, [teamNum, this._applySeqNumber++, this._procStepNumber, this.gnum, element.mid]);
            await this.sqliteSync.run(this.sqlUpdateTeamStatus, [1, element.score, element.age, element.female, element.gakgung, allTeams[i].advantage*(-1), teamNum]);
        }
    }
    
    
    /**
     * 그외 팀원들을 시수순으로 적용한다.
     */
    async addMembers() {
    
        if(!this.process_status){
            return;
        }
        console.log('addMembers ...');
        this._procStepNumber++;
    
        let orderedResult = await this.sqliteSync.all(this.sqlSelectOrderedMembers, [this.gnum, 15, 10000]);
        let teamNum = 0;
        let sql = this.sqlMinScoreTeam;
    
        for (let i = 0; i < orderedResult.length; i++) {
            
            let element = orderedResult[i];
            
            // 시수합계가 적은 팀에 다시수 인원을 우선배정한다.
            let minScoreTeamNum = await this.sqliteSync.get(sql, []);
            teamNum = minScoreTeamNum.team_num;
            await this.sqliteSync.run(this.sqlUpdateJakdae, [teamNum, this._applySeqNumber++, this._procStepNumber, this.gnum, element.mid]);
            await this.sqliteSync.run(this.sqlUpdateTeamStatus, [1, element.score, element.age, element.female, element.gakgung, 0, teamNum]);
        }
    }

    /**
     * 팀별 합계시수값을 균등하게 맞추기 위해 
     * 작대생성전에 팀별인원수가 동일해 지도록 가상의 궁사를 적용한다.
     * ex) 총 참가인원이 23명이고 5대로 생성시 부족한 팀원 2명을 평균시수를 적용하여 생성한다.
     */
    async addDummyPlayer() {

        if(!this.process_status){
            return;
        }
        console.log('addDummyPlayer ...');
        let dummyPlayers = await this.sqliteSync.get(this.selectSqlAvgScore, [this.team_count, this.gnum]);
        console.log(dummyPlayers);
        if(dummyPlayers.total_players == 0) {
            this.logErrorMsg(this.gnum + '회차 삭회에 참가한 선수가 존재하지 않습니다.!!!');
        }

        // 3순 평균시수를 3,6,9로 맞춘다. (1순시수를 정수로 맞추기 위해 ...)
        if(dummyPlayers.avg_score > 8)
            dummyPlayers.avg_score = 9;
        else if(dummyPlayers.avg_score > 5)
            dummyPlayers.avg_score = 6;
        else if(dummyPlayers.avg_score > 2)
            dummyPlayers.avg_score = 3;

        await this.sqliteSync.run("delete from monthly_game_personal_score where mid like 'dummy%'", []);
        let addPlayersCount = (dummyPlayers.add_player==this.team_count)?0:dummyPlayers.add_player;
        await this.sqliteSync.run(this.insertSqlDummyPlayers, [dummyPlayers.avg_score, this.gnum, addPlayersCount]);
    }

    async getTotalPlayersCount() {
        return await this.sqliteSync.get('select count(*) cnt from monthly_game_personal_score where gnum = :gnum and apply_team_game > 0 ', [this.gnum]);
    }

    async logErrorMsg(msg) {
        console.log('----------------------------------------------------');
        console.log(`--- ${msg}`);
        console.log('----------------------------------------------------');
        this.process_status = false;
    }

}    

module.exports = CreateTeamJakdae;


