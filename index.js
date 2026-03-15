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

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Forbidden');
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
                username: matchedUser.username,
                role: matchedUser.role
            };
            return req.session.save(() => res.redirect('/mainpage'));
        }

        return res.status(401).send("Невірний логін або пароль");
    });
});

app.post('/add-item', requireAuth, (req, res) => {
    const { name, type, serial, description, status } = req.body;
    console.log(req.body);
    const item = { name, type, serial, status, description };

    db.insert("components", "(name, type, serial, status, description)", item, (err, result) => {
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

        db.read("users", "id, username, role", (usersErr, usersResults) => {
            if (usersErr) {
                console.error(usersErr);
                return res.status(500).send("DB error");
            }

            db.read("usage_history", "id, equipment_id, user_id, date_returned", (usageErr, usageResults) => {
                if (usageErr) {
                    console.error(usageErr);
                    return res.status(500).send("DB error");
                }

                const assignedEquipmentIds = usageResults
                    .filter((entry) => entry.date_returned === null)
                    .map((entry) => Number(entry.equipment_id));
                    
                const userAssignedEquipmentIds = usageResults
                    .filter((entry) => entry.date_returned === null && Number(entry.user_id) === Number(req.session.user.id))
                    .map((entry) => Number(entry.equipment_id));
                console.log("User Assigned Equipment IDs:", userAssignedEquipmentIds);
                console.log("Assigned Equipment IDs:", assignedEquipmentIds);
                console.log("Items: ", results);
                res.render('mainpage', {
                    items: req.session.user.role === "admin" ? results : userAssignedEquipmentIds.map(id => results.find(item => item.id === id)).filter(item => item),
                    users: usersResults,
                    assignedEquipmentIds,
                    user: req.session.user
                });
            });
        });
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

app.post('/add-user', requireAuth, requireAdmin, (req, res) => {
    const { username, password, role } = req.body;
    const user = { username, password, role };
    db.insert("users", "(username, password, role) VALUES (?, ?, ?)", user, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }
        res.redirect('/mainpage');
    });
});

app.post('/assign-item', requireAuth, requireAdmin, (req, res) => {
    const { id, userId } = req.body;
    db.read("users", "id, role", (usersErr, usersRows) => {
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

        const usageEntry = { equipment_id: id, user_id: userId };
        db.insert("usage_history", "(equipment_id, user_id)", usageEntry, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
            res.redirect('/mainpage');
        });
    });
});

app.post('/unassign-item', requireAuth, requireAdmin, (req, res) => {
    const { id } = req.body;

    db.read("usage_history", "id, equipment_id, date_returned", (err, usageRows) => {
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
        db.update("usage_history", { id: latestAssignment.id, date_returned: new Date() }, (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send('Server error');
            }
            res.redirect('/mainpage');
        });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})