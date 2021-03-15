
/**
 * Schema Script를 실행하기 위한 클래스
 */
class RunDBSchemaScript {

    constructor() {
    }

    connect() {
        // Require or import the dependencies
        const sqlite3 = require("sqlite3").verbose();

        // Setup the database connection
        this.db = new sqlite3.Database("../database/salgozi.sqlite3", err => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Connected to the in-memory SQLite database.");
        });
    }

    run(filePath) {

        // Read the SQL file
        const fs = require("fs");
        const dataSql = fs.readFileSync(filePath).toString();
        const dataArr = dataSql.toString().split(";");

        // db.serialize ensures that your queries are one after the other depending on which one came first in your `dataArr`
        this.db.serialize(() => {
        // db.run runs your SQL query against the DB
        this.db.run("PRAGMA foreign_keys=OFF;");
        this.db.run("BEGIN TRANSACTION;");
        // Loop through the `dataArr` and db.run each query
        dataArr.forEach(query => {

            if (query.trim()) {
                // Add the delimiter back to each query before you run them
                // In my case the it was `);`
                query += ";";
                this.db.run(query, err => {
                    if (err) throw err;
                });
            }
        });
        this.db.run("COMMIT;");
        });
    }

    close() {
        // Close the DB connection
        this.db.close(err => {
            if (err) {
            return console.error(err.message);
            }
            console.log("Closed the database connection.");
        });
    }

}

module.exports = RunDBSchemaScript;