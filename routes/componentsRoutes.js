const express = require('express');
const db = require('../db/dbOperations');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/add-item', requireAuth, (req, res) => {
    const { name, type, serial, description, status } = req.body;
    const item = { name, type, serial, status, description };

    db.insert('components', '(name, type, serial, status, description)', item, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        return res.redirect('/');
    });
});

router.post('/update-item', requireAuth, (req, res) => {
    const { id, name, type, serial, status, description } = req.body;
    const item = { id, name, type, serial, status, description };

    db.update('components', item, (err) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        return res.redirect('/');
    });
});

router.post('/fix-item', requireAuth, (req, res) => {
    const { id } = req.body;
    db.update('components', { id, status: 'вільне' }, (err) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        return res.redirect('/');
    });
});

router.post('/remove', requireAuth, (req, res) => {
    const { id } = req.body;
    db.remove('components', 'id', { id }, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        return res.redirect('/');
    });
});

module.exports = router;
