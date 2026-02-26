//imports
const db = require("./db/dbOperations.js")
const express = require('express')
const app = express()
const port = 3000

// let sql_query = "INSERT INTO test_table VALUES (123, 'Test text')";
// db.query(sql_query, function (err, result) {
//     if (err) throw err;
//     console.log("1 record inserted");
//   });

db.insert("components", {id: 123, name: "I2C екран", type: "модуль", serial: "testserialnumber123", status: "використовується", description: "Ну типу екран"});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    db.read("components", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.render('index', { items: results });
    });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})