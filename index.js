//imports
const db = require("./db/dbOperations.js")
const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect("/loginpage");
});

app.get('/loginpage', (req, res) => {
    res.render('loginpage');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.read("users", "*", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }

        const matchedUser = results.find((user) => {
            const userLogin = user.username ?? user.login;
            const userPassword = user.password ?? user.password;
            return userLogin === username && userPassword === password;
        });

        if (matchedUser) {
            return res.redirect("/mainpage");
        }

        return res.status(401).send("Невірний логін або пароль");
    });
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