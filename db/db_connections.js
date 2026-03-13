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
      tempCon.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
      tempCon.query(`USE ${process.env.DB_NAME}`);
      tempCon.query(`CREATE TABLE IF NOT EXISTS \`components\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
            \`name\` varchar(255) DEFAULT NULL,
            \`type\` varchar(255) DEFAULT NULL,
            \`serial\` varchar(255) DEFAULT NULL,
            \`status\` varchar(255) DEFAULT NULL,
            \`description\` text,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`serial\` (\`serial\`))`);
            
      tempCon.query(`CREATE TABLE IF NOT EXISTS \`users\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`username\` text,
            \`password\` text,
            \`role\` varchar(50) DEFAULT 'user',
            PRIMARY KEY (\`id\`))`);

      tempCon.query(`CREATE TABLE IF NOT EXISTS \`usage_history\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int DEFAULT NULL,
        \`equipment_id\` int NOT NULL,
        \`date_taken\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`date_returned\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_equipment\` FOREIGN KEY (\`equipment_id\`) REFERENCES \`components\` (\`id\`) ON DELETE CASCADE
      )`);
    
      tempCon.query(`INSERT INTO \`users\` (id, username, password, role) VALUES (1,'admin','admin','admin')`
        , function(err, result) {
        if (err) throw err;
        console.log("Database created or already exists");
        tempCon.end();
      });
    });
    }
    else throw err;
  }
  con.query(`CREATE TABLE IF NOT EXISTS \`usage_history\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int DEFAULT NULL,
        \`equipment_id\` int NOT NULL,
        \`date_taken\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`date_returned\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_equipment\` FOREIGN KEY (\`equipment_id\`) REFERENCES \`components\` (\`id\`) ON DELETE CASCADE
      )`, function(tableErr) {
    if (tableErr) {
      console.error('Failed to ensure usage_history table:', tableErr);
    }
  });
  console.log("Connected!");
});

module.exports = con;