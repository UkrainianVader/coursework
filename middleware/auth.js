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

module.exports = {
    requireAuth,
    requireAdmin
};
