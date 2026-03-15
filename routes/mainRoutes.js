const express = require('express');
const db = require('../db/dbOperations');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/mainpage', requireAuth, (req, res) => {
    db.read('components', '*', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('DB error');
        }

        db.read('users', 'id, username, role', (usersErr, usersResults) => {
            if (usersErr) {
                console.error(usersErr);
                return res.status(500).send('DB error');
            }

            db.read('usage_history', 'id, equipment_id, user_id, date_returned', (usageErr, usageResults) => {
                if (usageErr) {
                    console.error(usageErr);
                    return res.status(500).send('DB error');
                }

                const assignedEquipmentIds = usageResults
                    .filter((entry) => entry.date_returned === null)
                    .map((entry) => Number(entry.equipment_id));

                const userAssignedEquipmentIds = usageResults
                    .filter((entry) => entry.date_returned === null && Number(entry.user_id) === Number(req.session.user.id))
                    .map((entry) => Number(entry.equipment_id));

                const assignmentByEquipmentId = assignedEquipmentIds.reduce((acc, equipmentId) => {
                    const assignment = usageResults.find((entry) => Number(entry.equipment_id) === equipmentId && entry.date_returned === null);
                    acc[equipmentId] = assignment ? usersResults.find((user) => Number(user.id) === Number(assignment.user_id)).username : null;
                    return acc;
                }, {});


                return res.render('mainpage', {
                    items: req.session.user.role === 'admin'
                        ? results
                        : userAssignedEquipmentIds
                            .map((id) => results.find((item) => Number(item.id) === Number(id)))
                            .filter((item) => item),
                    users: usersResults,
                    assignedEquipmentIds,
                    assignmentByEquipmentId,
                    user: req.session.user
                });
            });
        });
    });
});

module.exports = router;
