let db = require("./db_connections.js")

const dbOperations = {
    insert: (tableName, data, callback) => {
        let sql_query = `INSERT INTO ${tableName} (id, name, type, serial, status, description) VALUES (?, ?, ?, ?, ?, ?)`;
        let values = [data.id, data.name, data.type, data.serial, data.status, data.description];

        db.query(sql_query, values, function (err, result) {
            if (callback) {
                return callback(err, result);
            }
            if (err) throw err;
            console.log("1 record inserted");
        });
    },
    remove: (tableName, column, data, callback) => {
        let sql_query = `DELETE FROM ${tableName} WHERE ${column} = ${data.id}`;
        db.query(sql_query, function (err, result) {
            if (callback) {
                return callback(err, result);
            }
            if (err) throw err;
            console.log("1 record deleted");
        });
    },
    update: (tableName, data) => {
        let sql_query = `UPDATE ${tableName} SET test_column2 = '${data.name}' WHERE test_column1 = ${data.id}`;
        db.query(sql_query, function (err, result) {
            if (err) throw err;
            console.log("1 record updated");
        });
    },
    read: (tableName, callback) => {
        let sql_query = `SELECT * FROM ${tableName}`;
        db.query(sql_query, function (err, result) {
            if (callback) {
                return callback(err, result);
            }
            if (err) throw err;
            return result;
        });
    }
}

module.exports = dbOperations;