const login = require('../controllers/login.js');
const router = require('express-promise-router')();
const passport = require('passport');
const passStrats = require('../config/passport.js');
const passJwt = passport.authenticate('userJwt', { successRedirect: '/config' });

router.route('/').get(login.render);
router.route('/').post(login.login);
router.route('/logout').get(login.logout);
router.route('/verify').get(passJwt);

module.exports = router;
