

/* 작대 명단 추출하기 */
select m.name, total_hits "시수", m.birthday, m.position_name "호칭", m.shooting_priority "팔찌동" 
from monthly_game_personal_score s, members m 
where s.mid = m.mid
and s.gnum = :gnum
order by s.total_hits desc, m.shooting_priority, m.birthday 


select *
from members


/* 개인전 순위 추출하기 */
select name, (total_hits + bonus) "총시수 ", total_hits "본시수", bonus "보너스", gakgung "각궁",  round1_hits "첫순", ifnull(win_gnum, '') "비고"
from (
	select m.name, s.total_hits, s.bonus, gakgung, round1_hits
		,(select b.gnum 
		    from monthly_game_personal_score b, monthly_game_master m 
		    where b.mid = s.mid
		    and b.gnum = m.gnum
		    and b.ranking = 1
		    and b.gnum <= s.gnum
		    and m.event_year = g.event_year
		  ) win_gnum
	from monthly_game_personal_score s, members m, monthly_game_master g 
	where s.mid = m.mid
	and s.gnum = g.gnum
	and s.gnum = :gnum
) s
order by win_gnum, (total_hits + bonus) desc, gakgung desc , round1_hits desc 




select *
from monthly_game_personal_score
where ranking = 1;