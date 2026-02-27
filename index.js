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

//db.insert("components", {id: 123, name: "I2C екран", type: "модуль", serial: "testserialnumsdfsfdsdfsdfsdfber123", status: "використовується", description: "Ну типу екран"});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     db.read("components", (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("DB error");
//         }
//         res.render('index', { items: results });
//     });
// });

app.get('/', (req, res) => {
    res.redirect("/loginpage");
});

app.get('/loginpage', (req, res) => {
    res.render('loginpage');
});


app.post('/login', (req, res) => {
  const {username, password} = req.body;
    if (username == db.read("users", "username", (err, result) => {return result;}) && password == db.read("users", "password"), (err, result) => {return result;}) {
        res.redirect("/mainpage");
    }
    else {
      console.log(req.body);
        res.status(401).send("Невірний логін або пароль");
    }
});

app.post('/add-item', (req, res) => {
    const { id, name, type, serial, description, status } = req.body;
    console.log(req.body);
    const item = { id, name, type, serial, status, description };

    db.insert("components", item, (err, result) => {
        if (err) return res.status(500).send(err);
        
        res.redirect('/'); 
    });
});

app.post("/remove", (req, res) => {
    const { id } = req.body;
    db.remove("components", "id", { id }, (err, result) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

app.get("/mainpage", (req, res) => {
   db.read("components", "*", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.render('mainpage', { items: results });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})