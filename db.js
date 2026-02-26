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
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con;