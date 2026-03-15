const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');
const componentsRoutes = require('./routes/componentsRoutes');
const assignmentsRoutes = require('./routes/assignmentsRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
const port = 3000;

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

app.use('/', authRoutes);
app.use('/', mainRoutes);
app.use('/', componentsRoutes);
app.use('/', assignmentsRoutes);
app.use('/', usersRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})