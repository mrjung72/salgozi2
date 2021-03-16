
var ManipulateSqliteDatas = require('../routes/model/manipulateDatas.js');
let manipulDatas = new ManipulateSqliteDatas();

let sqlmembers = "insert into members (mid, name, gender, birthday, position_name, shooting_priority, bonus, status, msg, create_date) "
               + "values (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y%m%d', date('now', 'localtime'))) ";

manipulDatas.inputDatas('./members.csv', sqlmembers, 'members');

