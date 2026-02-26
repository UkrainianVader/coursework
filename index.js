//imports
const db = require("./db.js")
const express = require('express')


let sql_query = "INSERT INTO test_table VALUES (123, 'Test text')";
db.query(sql_query, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})