/* 데이터베이스를 선택한다. */
.open ../../database/salgozi.sqlite3


/* 회원명부*/
drop table if exists members ;
create table members (
	 mid text PRIMARY KEY						-- 회원ID
	,name text not null							-- 이름
	,gender text default 'M'					-- 성별(M-남자, W-여자)
	,birthday text not null					-- 생일
	,position_name text not null    -- 직책
	,shooting_priority integer default 0 -- 팔찌동(1-사두, 2-고문, 3-접장, 4-초몰기후 6개월미만, 5-신사, 9-교육생)
	,bonus integer default 0   			-- 덤
	,status text default 'Y'   		-- 회원상태 (Y-정회원, N-미회원)
	,msg text    					-- 비고
	,create_date text not null     	-- 등록일자
);

/* 월삭회 정보 */
drop table if exists monthly_game_master ;
create table monthly_game_master (
	 gnum integer primary key		-- 삭회회차
	,event_year integer not null    -- 개최연도
	,event_date text not null     	-- 개최일자
	,status text default 'P'   		-- 상태 (P-진행중, F-종료)
);	

/* 2020년 1월 291회 삭회  */
insert into monthly_game_master	(gnum ,event_year, event_date, status) values 
 (291, 2020, '2020-01-11', 'F')
,(292, 2020, '2020-11-14', 'F');


/* 월삭회 개인기록 */
drop table if exists monthly_game_personal_score ;
create table monthly_game_personal_score (
	 gnum integer not null				-- 삭회회차
	,mid text not null					-- 회원ID
	,age integer default 0				-- 나이
	,gakgung integer default 0			-- 각궁여부(0-개량궁, 1-각궁궁)
	,female integer default 0			-- 여무사여부(0-남궁사, 1-여궁사)
	,round1_hits integer default 0 		-- 1순 시수
	,round2_hits integer default 0 		-- 2순 시수
	,round3_hits integer default 0		-- 3순 시수
	,bonus integer default 0			-- 덤
	,ranking integer default 0			-- 순위
	,shooting_group integer default 0	-- 작대
	,shotting_seq integer default 0		-- 사대순서
	,apply_team_game integer default 1	-- 단체전참가여부(1-참가, 0-불참)
	,msg text                           -- 비고
	,primary key (gnum, mid)
	,foreign key (gnum) references monthly_game_master (gnum)
	,foreign key (mid) references members (mid)
);


/* 월삭회 개인전 작대정보 */
drop table if exists monthly_game_shooting_group ;
create table monthly_game_shooting_group (
	 gnum integer not null				-- 삭회회차
	,mid text not null					-- 회원ID
	,shooting_group integer default 0	-- 작대
	,shooting_seq integer default 0		-- 사대순서
	,primary key (gnum, mid)
	,foreign key (gnum) references monthly_game_master (gnum)
	,foreign key (mid) references members (mid)
);

/* 월삭회 팀기록 */
drop table if exists monthly_game_team_score ;
create table monthly_game_team_score (
	 gnum integer not null						-- 삭회회차
	,team_num integer not null				-- 팀번호
	,mid text not null								-- 회원ID
	,gakgung integer default 0				-- 각궁여부
	,round1_hits integer default 0 		-- 1순 시수
	,round2_hits integer default 0 		-- 2순 시수
	,round3_hits integer default 0		-- 3순 시수
	,total_hits integer default 0			-- 총 시수
	,shooting_group integer default 0	-- 작대
	,shotting_seq integer default 0		-- 사대순서
	,primary key (gnum, team_num, mid)
	,foreign key (gnum) references monthly_game_master (gnum)
	,foreign key (mid) references members (mid)
);


SELECT DATE('NOW', 'localtime');

/* 단체전 작대 */
DROP TABLE IF exists monthly_game_team_jakdae;
create table monthly_game_team_jakdae (
	 gnum integer not null				-- 삭회회차
	,mid text not null					-- 회원ID
	,team_num integer 			-- 팀번호
	,age_class integer default 0		-- 연령구분
	,shooting_priority integer default 0		-- 팔찌동
	,upt_number integer default 0		-- 적용순서
	,proc_step integer default 0		-- 처리단계
	,primary key (gnum, mid)
);


/* 팀별 현재 상태값 */
DROP TABLE IF exists team_jakdae_status;
create table team_jakdae_status (
	 team_num integer primary key 			-- 팀번호
	,member_count integer default 0		-- 인원수
	,score_sum integer default 0		-- 시수합계
	,age_sum integer default 0		-- 나이합이
	,female_count integer default 0		-- 여무사인원
	,gakgung_count integer default 0		-- 각궁인원
	,advantage integer default 0		-- 우선선발권 ( 팀별시수균형을 맞추기 위해 적용한다. 1:팀원우선선원권1회, -1:팀원선발권1회삭감)
);



