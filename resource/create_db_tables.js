
var RunDBSchemaScript = require('../routes/model/runDBSchemaScript.js');
let runScript = new RunDBSchemaScript();
runScript.connect();
runScript.run("./db_schema/create_tables.sql");
runScript.close();

