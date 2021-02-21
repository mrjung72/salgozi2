let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('../../database/salgozi.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
  if(err) {
    console.error(err.message);
  }
  console.log('Connected to the salgozi database!');
});

const SqliteDBPrimse = require('../model/sqlite3-promise.js');
let SqliteDB = require('../model/sqlite3-promise.js');
let sqliteSync = new SqliteDB();
sqliteSync.open(db);

let EvenTeamGakgungCount = require('../model/even_team_gakgung_count.js');
let CreateTeamJakdae = require('../model/create_team_jakdae.js');


/**
 * 현재 진행중인 삭회 회차를 반환한다.
 */
async function getCurrentGameNumber() {
  let ret = await sqliteSync.get("select gnum from monthly_game_master where status = :status", ['P']);
  if(ret) {
    console.log('삭회회차 : ' + ret.gnum);
    return ret.gnum;
  }
  else {
    errorLog('현재 진행 중인 삭회가 존재하지 않습니다.!!!');
    return -1;
  }
}

async function errorLog(errMsg) {
  console.log('----------------------------------------------------');
  console.log('--- ' + errMsg);
  console.log('----------------------------------------------------');
};

async function createTeamJakdae(team_count) {

    let gnum = await getCurrentGameNumber();
    if(gnum < 0) {
      return;
    }
    console.log(`생성작대 : ${team_count}대`);
    
    let teamJak = await new CreateTeamJakdae(sqliteSync, gnum, team_count);
    let playersCntRet = await teamJak.getTotalPlayersCount();
    if(team_count <= 1) {
      errorLog(`작대수(${team_count})는 1보다 큰 정수값이어야 합니다.!!!`);
      return;
    }
    else if(team_count > playersCntRet.cnt) {
      errorLog(`작대수(${team_count})가 참가선수(${playersCntRet.cnt}명)보다 클 수 없습니다.!!!`);
      return;
    }
    
    await teamJak.addDummyPlayer();
    await teamJak.createTeam();
    await teamJak.applyFirstPlayer(); 
    await teamJak.applySecondPlayer(); 
    await teamJak.addMembers();

    let evenGak = new EvenTeamGakgungCount(sqliteSync);
    await evenGak.run(gnum, team_count);
    
}

let team_count = process.argv[2];
if(isNaN(team_count)) {
  errorLog(`작대수(${team_count})는 정수값이어야 합니다.!!!`);
  return;
}
else {
  createTeamJakdae(Number(team_count));
}
