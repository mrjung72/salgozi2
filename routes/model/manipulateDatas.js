
/**
 * SQLite DB 데이터를 조작하기 위한 클래스
 */
class ManipulateSqliteDatas {

    constructor() {
        let sqlite3 = require('sqlite3').verbose();
        // open the database
        let db = new sqlite3.Database('../database/salgozi.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
          if(err) {
            console.error(err.message);
          }
          console.log('Connected to the salgozi database!');
        });

        let SqlitePromise = require('./sqlite3-promise');
        this.sqliteDB = new SqlitePromise();
        this.sqliteDB.open(db);

        this.iconv = require('iconv-lite');
    }

    /**
     * 데이터 입력작업을 한다.
     * @param {*} readFilePath 
     * @param {*} sql 
     * @param {*} inputTable 
     */
    async inputDatas(readFilePath, sql, inputTable) {

        const fs = require('fs'); 
        let content = fs.readFileSync(readFilePath);
        let decodedContent = this.iconv.decode(content, 'euc-kr');

        let result = await this.sqliteDB.run('delete from ' + inputTable, []);
        console.log('Total rows of ' + result.changes + ' were deleted!!!');

        let rowDatas = decodedContent.split('\n');
        
        let insCnt = 0;
        for (let i = 0; i < rowDatas.length; i++) {
            if(i == 0 || rowDatas[i].trim() == '') continue;
            
            let row = rowDatas[i].split(',');
            console.log(row);
            
            let insResult = await this.sqliteDB.run(sql, row);
            insCnt += insResult.changes;
        }
        console.log('Total rows of ' + insCnt + ' were insert!!!');

        // 단체전 작대생성시 팀별 시수 균등배분을 위해 사용될 더미선수를 추가한다.
        for (let i = 1; i < 10; i++) {
          await this.sqliteDB.run(sql, ['dummy'+i, '-', '', '2021-01-01', '-', 11, 0, 'N', '']);
        }
    }
    
}

module.exports = ManipulateSqliteDatas;