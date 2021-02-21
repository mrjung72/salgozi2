/**------------------------------------------------------
 *  SQLite3 DB처리를 위한 Promise 함수정의
 *-------------------------------------------------------*/
class SqliteDBPrimse {

    constructor(db) {
        this.db = db;
    }

    open = function(db) {

        let self = this;
        return new Promise(function(resolve) {
            self.db = db;
        });
    }

    run = function(query, params) {

        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.run(query, params, function(err) {
                if(err)
                    reject(err.message);
                else 
                    resolve({'lastId':this.lastId, 'changes':this.changes});
            });
        });
    }

    get = function(query, params) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(query, params, function(err, row) {
                if(err)
                    reject('Read error: ' + err.message);
                else
                    resolve(row);
            });
        });
    }

    all = function(query, params) {
        let self = this;
        return new Promise(function(resolve, reject) {
            if(params == undefined)
                params = [];

            self.db.all(query, params, function(err, rows) {
                if(err)
                    reject('Read error : ' + err.message);
                else
                    resolve(rows);
            });
        });
    }

    each = function(query, params, action) {
        let self = this;
        return new Promise(function(resolve, reject) {
            var db = self.db;
            db.serialize(function() {
                db.each(query, params, function(err, row) {
                    if(err)
                        reject('Read error : ' + err.message);
                    else {
                        if(row)
                            action(row);
                    }
                });

                db.get("", function(err, row) {
                    resolve(true);
                });
            });
        });
    }

    close = function() {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.close();
            resolve(true);
        });
    }
}

module.exports = SqliteDBPrimse;
