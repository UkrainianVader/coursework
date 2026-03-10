//imports
const db = require("./db/dbOperations.js")
const express = require('express')
const app = express()
const session = require('express-session')
const port = 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'verysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/loginpage');
    }
    next();
};

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/mainpage');
    }
    res.redirect("/loginpage");
});

app.get('/loginpage', (req, res) => {
    if (req.session.user) {
        return res.redirect('/mainpage');
    }
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
            req.session.user = {
                id: matchedUser.id,
                username: matchedUser.username ?? matchedUser.login
            };
            return req.session.save(() => res.redirect('/mainpage'));
        }

        return res.status(401).send("Невірний логін або пароль");
    });
});

app.post('/add-item', requireAuth, (req, res) => {
    const { id, name, type, serial, description, status } = req.body;
    console.log(req.body);
    const item = { id, name, type, serial, status, description };

    db.insert("components", item, (err, result) => {
        if (err) return res.status(500).send(err);
        
        res.redirect('/'); 
    });
});

app.post("/remove", requireAuth, (req, res) => {
    const { id } = req.body;
    db.remove("components", "id", { id }, (err, result) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

app.get("/mainpage", requireAuth, (req, res) => {
   db.read("components", "*", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.render('mainpage', { items: results });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.clearCookie('connect.sid');
        return res.redirect('/loginpage');
    });
});

app.post('/update-item', requireAuth, (req, res) => {
    const item = { id, name, type, serial, status, description } = req.body;
    db.update("components", item, (err, result) => {
        if (err) return res.status(500).send('Server error');
        res.redirect('/');
    });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})