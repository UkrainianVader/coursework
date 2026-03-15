const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/dbOperations');

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/mainpage');
    }
    return res.redirect('/loginpage');
});

router.get('/loginpage', (req, res) => {
    if (req.session.user) {
        return res.redirect('/mainpage');
    }
    return res.render('loginpage');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.read('users', '*', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('DB error');
        }

        const matchedUser = results.find((user) => {
            const dbUsername = user.username || user.login;
            return dbUsername === username;
        });

        if (matchedUser) {
            const isMatch = bcrypt.compareSync(password, matchedUser.password);

            if (isMatch) {
                req.session.user = {
                    id: matchedUser.id,
                    username: matchedUser.username,
                    role: matchedUser.role
                };
                return req.session.save(() => res.redirect('/mainpage'));
            }
        }

        return res.status(401).send('Невірний логін або пароль');
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.clearCookie('connect.sid');
        return res.redirect('/loginpage');
    });
});

module.exports = router;
