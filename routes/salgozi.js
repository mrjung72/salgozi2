var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
// open the database
let db = new sqlite3.Database('./database/salgozi.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
  if(err) {
    console.error(err.message);
  }
  console.log('Connected to the salgozi database!');
});


function selectDatas(sql, params, callback) {

  console.log(sql);

    db.all(sql, params, (err, rows) => {
      if(err) {
        callback({isSuccess:false, errmsg:err});
      }
      else {
        callback({isSuccess:true, rows:rows});
      }
    });
}

function getSqlQuery(sql, searchCond, defaultSortby) {

  let sortby = defaultSortby;
  if(searchCond && searchCond.sort_column)
    sortby = searchCond.sort_column + ' ' + searchCond.sort_by;

  let sqlQuery = sql.replace('{SORT_BY_COLUMNS}', sortby);


  if(searchCond && searchCond.col_name)
    sqlQuery += " and " + searchCond.col_name + " like '%" + searchCond.svalue + "%'";

  sqlQuery += " order by " + sortby;

  return sqlQuery;
}


function responseSearchResult(req, res, pagePath, result) {

    if(req.query.protocol === 'json'){
      res.json(result);
    }
    else {
      res.render(pagePath, result);
    }
}

function getMaxGameNumber(callback) {

  let sql = " select max(gnum) gnum from monthly_game_master ";
  db.each(sql, function(err, row) {
      callback(row.gnum);
  });
}

function isOpenGame(callback) {

  let sql = " select max(gnum) gnum from monthly_game_master where status = 'P' ";
  db.each(sql, function(err, row) {
      callback(row.gnum);
  });
}


function addGameMaster(callback) {

  let sql = " insert into monthly_game_master (gnum, event_date, event_year) " 
          + " values (?, date('now', 'localtime'), strftime('%Y', date('now', 'localtime'))); "

  getMaxGameNumber(function(maxGameNumber) {
    
    db.run(sql, [maxGameNumber+1], function(err) {
      if(err) {
        callback({isSuccess:false, rtnMsg:err.message});
        return;  
      }

      console.log('1 row has been inserted with rowid ' + this.lastID);
      callback({isSuccess:true, rtnMsg:this.lastID+"회 대회가 생성 되었습니다.!"});
    });

  });
}


function applyMembersToGame(gnum, memberIds, callback) {

  if(memberIds.length < 1) {
    callback({isSuccess:false, rtnMsg:"적용할 회원이 없습니다.!"});
    console.log(' members is not exists!!!!!!!');
    return;  
  }

  let memStr = memberIds.join("', '");
  let sql = " insert into monthly_game_personal_score (gnum, mid, bonus, age, female) "
          + " select " + gnum + ", mid, bonus "
          + "       ,(strftime('%Y', date('now', 'localtime')) - strftime('%Y', birthday) + 1) age  "
          + " ,case when m.gender = 'M' then 0 else 1 end female "
          + " from members m "
          + " where mid in ('" + memStr + "') "
          + " and not exists ( "
          + "   select 1 "
          + "   from monthly_game_personal_score s  "
          + "   where s.mid = m.mid  "
          + "   and s.gnum = " + gnum
          + " ) ";

  manupulateDatas(sql, function(result) {
    callback(result);
  });
}

function applyShootingGroup(gnum, group_count, callback) {

  let sql = " insert into monthly_game_shooting_group "
          + " select gnum, mid, (shooting_priarity-1)%"+group_count+"+1 group_num, shooting_priarity   "
          + " from ( "
          + "   select gnum, m.mid "
          + "         ,row_number() over ( order by m.shooting_priority, m.birthday ) shooting_priarity "
          + "     from monthly_game_personal_score s, members m "
          + "    where gnum = " + gnum
          + "      and m.mid = s.mid "
          + ") ";

  manupulateDatas(sql, function(result) {
    callback(result);
  });

}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('salgozi/index', { title: 'Express' });
});


/* GET members listing. */
router.get('/members', function(req, res, next) {

  let sql = " select m.* "
          + ",(strftime('%Y', date('now', 'localtime')) - strftime('%Y', birthday) + 1) age  "
          + ",row_number() over ( order by {SORT_BY_COLUMNS} ) rownum"
          + " from members m "
          + " where status = 'Y'"
          + " and not exists ( "
          + "   select 1 "
          + "   from monthly_game_personal_score s  "
          + "   where s.mid = m.mid  "
          + "   and s.gnum = (select gnum from monthly_game_master where status = 'P') "
          + " ) ";

  let default_sortby = 'shooting_priority, birthday';

  var sqlQuery = getSqlQuery(sql, req.query.params, default_sortby);

  selectDatas(sqlQuery, [], function(result) {
    responseSearchResult(req, res, 'salgozi/members', result);
  });
});

/* GET games listing. */
router.get('/monthly_games', function(req, res, next) {

  let sql = " select m.* "
          + " from monthly_game_master m "
          + " where 1 =1  ";
  var sqlQuery = getSqlQuery(sql, req.query.params, 'gnum');

  selectDatas(sqlQuery, [], function(result) {
    responseSearchResult(req, res, 'salgozi/monthly_games', result);
  });
});



router.get('/game_score', function(req, res, next) {

  getMaxGameNumber(function(maxGameNumber){
    res.render('salgozi/game_score_personal', { game_num: maxGameNumber });
  });

});


/* GET personal_score listing. */
router.get('/game_personal_score', function(req, res, next) {

  let sql = " select * "
          + " from ( "
          + "     select s.*, m.name, m.position_name, m.shooting_priority "
          + "           ,(strftime('%Y', date('now', 'localtime')) - strftime('%Y', birthday) + 1) age "
          + "           ,(s.round1_hits + s.round2_hits + s.round3_hits) real_hits "
          + "           ,(s.round1_hits + s.round2_hits + s.round3_hits + s.bonus) total_hits "
          + "     from monthly_game_personal_score s, members m "
          + "     where s.mid = m.mid "
          + "     and gnum = " + req.query.params.gnum
          + "     and m.mid not like 'dummy%' "
          + " ) "
          + " where 1 = 1 ";

  var sqlQuery = getSqlQuery(sql, req.query.params, 'total_hits desc, real_hits desc, gakgung desc, round1_hits desc');
  selectDatas(sqlQuery, [], function(result) {
    responseSearchResult(req, res, 'salgozi/game_score_personal', result);
  });
});


/* GET personal_score listing. */
router.get('/game_members', function(req, res, next) {

  let sql = " select s.gnum, s.bonus, m.name, m.position_name, m.mid, s.gakgung "
          + "       ,row_number() over ( order by {SORT_BY_COLUMNS} ) rownum"
          + "       ,(strftime('%Y', date('now', 'localtime')) - strftime('%Y', birthday) + 1) age "
          + " from monthly_game_personal_score s, members m "
          + " where s.mid = m.mid "
          + "   and m.mid not like 'dummy%' "
          + "   and gnum = " + req.query.params.gnum;
  var sqlQuery = getSqlQuery(sql, req.query.params, 'm.shooting_priority, m.birthday');
  selectDatas(sqlQuery, [], function(result) {
      res.json(result);
  });
});


/* GET personal_score listing. */
router.get('/select_datas', function(req, res, next) {

  selectDatas(req.query.sql, req.query.params, function(result) {

    console.log(result);

      res.json(result);
  });
});


router.get('/game_shooting', function(req, res, next) {

  getMaxGameNumber(function(maxGameNumber){
    res.render('salgozi/game_shooting_group', { game_num: maxGameNumber });
  });

});


router.get('/game_team_jakdae', function(req, res, next) {

  getMaxGameNumber(function(maxGameNumber){
    res.render('salgozi/game_team_jakdae', { game_num: maxGameNumber });
  });

});

router.get('/game_shooting_group', function(req, res, next) {
  req.query.params['shooting_group'] = '';
  selectGameShootingGroup(req.query.params, function(result){
    res.json(result);
  });
});
router.get('/game_shooting_group_by_team', function(req, res, next) {
  selectGameShootingGroup(req.query.params, function(result){
    res.json(result);
  });
});


function selectGameShootingGroup(searchCond, callback) {

  console.log(searchCond);

  let sql = " select g.gnum, g.mid, m.name, m.position_name, s.age, g.shooting_group, g.shooting_seq, s.gakgung, s.age "
          + " from monthly_game_shooting_group g, members m, monthly_game_personal_score s "
          + " where m.mid = g.mid "
          + " and s.mid = g.mid "
          + " and m.mid not like 'dummy%' "
          + " and s.gnum = g.gnum "
          + " and g.gnum = " + searchCond.gnum;

  if(searchCond.shooting_group && searchCond.shooting_group != '')
    sql += " and g.shooting_group = " + searchCond.shooting_group;

  var sqlQuery = getSqlQuery(sql, searchCond, 'g.shooting_group, g.shooting_seq');
  selectDatas(sqlQuery, [], function(result) {
      callback(result);
  });
}

function selectTeamJakdaeByNum(searchCond, callback) {

  let sql 
    = " select s.gnum, j.mid, j.team_num, s.gakgung, (round1_hits + round2_hits + round3_hits) score, s.age, j.upt_number, age_class, female, m.name, m.position_name "
    + " from monthly_game_team_jakdae j, monthly_game_personal_score s, members m "
    + " where s.mid = j.mid "
    + " and s.mid = m.mid "
    + " and s.gnum = " + searchCond.gnum
    + " and s.gnum = j.gnum ";
    + " and m.mid not like 'dummy%' "

  if(searchCond.team_num && searchCond.team_num != '')
    sql += " and j.team_num = " + searchCond.team_num;
  else
    sql += " and j.team_num is not null ";

  var sqlQuery = getSqlQuery(sql, searchCond, 'team_num, j.shooting_priority, age desc');
  console.log(sqlQuery);
  selectDatas(sqlQuery, [], function(result) {
      callback(result);

  });

}


router.get('/select_team_jakdae', function(req, res, next) {

  selectTeamJakdaeByNum(req.query.params, function(result){
    res.json(result);
  });
});

router.get('/select_team_jakdae_by_team', function(req, res, next) {

  selectTeamJakdaeByNum(req.query.params, function(result){
    res.json(result);
  });
});

router.get('/select_team_jakdae_summary', function(req, res, next) {

  let sql = " select * from team_jakdae_status ";
  selectDatas(sql, [], function(result) {
      res.json(result);
  });
});




function addGame(callback) {

  isOpenGame(function(gnum) {
    if(gnum > 0) {
      callback({isSuccess:false, rtnMsg:"현재 진행 중인 대회(" + gnum + "회)가 존재 합니다.!"});
    }
    else {
      addGameMaster(function(result) {
        callback(result);
      });
    }
  });
}


router.get('/add', function(req, res, next) {

  if(req.query.categoryId == 'game_members') {
      applyMembersToGame(req.query.params.gnum, req.query.params.memberIds, function(result) {
        res.json(result);
      });
  }
  else if(req.query.categoryId == 'monthly_games') {

    addGame(function(result) {
      res.json(result);
    });
  }
  else if(req.query.categoryId == 'game_shooting_group') {

    applyShootingGroup(req.query.params.gnum, req.query.params.group_count, function(result) {
      res.json(result);
    });
  }
  else {
    res.json({isSuccess:false, rtnMsg:req.query.categoryId + "는 기정의된 카테고리ID가 아닙니다.!"});
  }

});

router.get('/modify', function(req, res, next) {

  let sqlQuery = getModifySql(req.query.categoryId, req.query.params);
  manupulateDatas(sqlQuery, function(result) {
    res.json(result);
  });
});

router.get('/delete', function(req, res, next) {

  let sqlQuery = getDeleteSql(req.query.categoryId, req.query.params);
  manupulateDatas(sqlQuery, function(result) {
    res.json(result);
  });
});


function manupulateDatas(sqlQuery, callback) {

  console.log('--------------------------------------------');
  console.log('--------------- manupulateDatas ------------');
  console.log('--------------------------------------------');
  console.log(sqlQuery);
  console.log('--------------------------------------------');

  try {
      db.run(sqlQuery, [], function(err) {
        if(err) {
          callback({isSuccess:false, rtnMsg:'데이터 수정시 오류가 발생하였습니다.!\n' + err.message});
        }
        else {
          callback({isSuccess:true, rtnMsg:this.changes + "건이 수정 되었습니다.!"});
        }
      });
  }
  catch(err) {
    console.log(err);
    callback({isSuccess:false, rtnMsg:err.message});
  }

}

function getModifySql(categoryId, queryParams) {



  var sqlQueryByCategoryId = {
    monthly_games:
          " update monthly_game_master "
        + " set event_date = '" + queryParams.event_date + "'"
        + "    ,status = '" + queryParams.status + "'"
        + " where gnum = '"+queryParams.gnum+"'"
    ,game_personal_score:
          " update monthly_game_personal_score "
        + " set gakgung = " + queryParams.gakgung
        + "    ,round1_hits = " + queryParams.round1_hits
        + "    ,round2_hits = " + queryParams.round2_hits
        + "    ,round3_hits = " + queryParams.round3_hits
        + " where gnum = '"+queryParams.gnum+"'"
        + "   and mid = '"+queryParams.mid+"' "
    ,game_members:
          " update monthly_game_personal_score "
        + " set bonus = " + queryParams.bonus
        + "  ,gakgung = " + queryParams.gakgung
        + " where gnum = '"+queryParams.gnum+"'"
        + "   and mid = '"+queryParams.mid+"' "
    ,select_team_jakdae:
        " update monthly_game_team_jakdae "
        + " set team_num = " + queryParams.team_num
        + " where gnum = '"+queryParams.gnum+"'"
        + "   and mid = '"+queryParams.mid+"' "
    ,game_shooting_group:
          "update monthly_game_shooting_group " 
        + "   set shooting_group = " + queryParams.shooting_group
        + " where gnum = '"+queryParams.gnum+"'"
        + "   and mid = '"+queryParams.mid+"' "
  };
  return sqlQueryByCategoryId[categoryId];
}


function getDeleteSql(categoryId, queryParams) {

  var sqlQueryByCategoryId = {
    monthly_games:
          " delete from monthly_game_master "
        + " where gnum = '"+queryParams.gnum+"'"
    ,game_members:
          " delete from monthly_game_personal_score "
        + " where gnum = '"+queryParams.gnum+"'"
        + "   and mid = '"+queryParams.mid+"' "
    ,game_shooting_group:
          " delete from monthly_game_shooting_group "
        + " where gnum = '"+queryParams.gnum+"'"
    ,select_team_jakdae:
          " delete from monthly_game_team_jakdae "
        + " where gnum = '"+queryParams.gnum+"' "
    ,team_jakdae_status:
          " delete from team_jakdae_status "

  };
  return sqlQueryByCategoryId[categoryId];
}

module.exports = router;
