const express = require('express');
const db = require('../db/dbOperations');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/assign-item', requireAuth, requireAdmin, (req, res) => {
    const { id, userId } = req.body;
    db.read('users', 'id, username, role', (usersErr, usersRows) => {
        if (usersErr) {
            console.error(usersErr);
            return res.status(500).send('Server error');
        }

        const selectedUser = usersRows.find((u) => Number(u.id) === Number(userId));
        if (!selectedUser) {
            return res.status(400).send('Selected user not found');
        }

        if (selectedUser.role === 'admin') {
            return res.status(400).send('Cannot assign component to admin user');
        }

        const usageEntry = {
            equipment_id: id,
            user_id: userId,
            username: selectedUser.username
        };

        db.insert('usage_history', '(equipment_id, user_id, username)', usageEntry, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
            return res.redirect('/mainpage');
        });
        db.update('components', { id, status: 'призначене' }, (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send('Server error');
            }
        });
    });
});

router.post('/unassign-item', requireAuth, requireAdmin, (req, res) => {
    const { id } = req.body;

    db.read('usage_history', 'id, equipment_id, date_returned', (err, usageRows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        const activeAssignments = usageRows
            .filter((row) => Number(row.equipment_id) === Number(id) && row.date_returned === null)
            .sort((a, b) => b.id - a.id);

        if (!activeAssignments.length) {
            return res.redirect('/mainpage');
        }

        const latestAssignment = activeAssignments[0];
        db.update('usage_history', { id: latestAssignment.id, date_returned: new Date() }, (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send('Server error');
            }
            db.update('components', { id, status: 'вільне' }, (componentErr) => {
                if (componentErr) {
                    console.error(componentErr);
                    return res.status(500).send('Server error');
                }
                return res.redirect('/mainpage');
            });
        });
    });
});

module.exports = router;
