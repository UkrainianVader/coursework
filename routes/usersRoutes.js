const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/dbOperations');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/add-user', requireAuth, requireAdmin, (req, res) => {
    const saltRounds = 10;
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const user = { username, password: hashedPassword, role };

    db.insert('users', '(username, password, role) VALUES (?, ?, ?)', user, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }
        return res.redirect('/mainpage');
    });
});

module.exports = router;
