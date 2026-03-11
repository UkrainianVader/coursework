let mysql = require('mysql2');
let dotenv = require('dotenv');
dotenv.config();

//db connection
let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

con.connect(function(err) {
  if (err){
    if (err.code === 'ER_BAD_DB_ERROR') {
    console.log("Database not found, creating...");
    let tempCon = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: process.env.DB_PASSWORD
    });
    tempCon.connect(function(err) {
      if (err) throw err;
      tempCon.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, function(err, result) {
        if (err) throw err;
        console.log("Database created or already exists");
        tempCon.end();
      });
    });
    }
    else throw err;
  }
  console.log("Connected!");
});

module.exports = con;