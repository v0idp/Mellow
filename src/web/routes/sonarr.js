const config = require('../controllers/config.js');
const sonarr = require('../controllers/sonarr.js');
const router = require('express-promise-router')();
const passport = require('passport');
const passStrats = require('../config/passport.js');
const passJwt = passport.authenticate('userJwt', { failureRedirect: '/login' });

router.route('/').post(passJwt, config.save);
router.route('/test').post(passJwt, sonarr.test);
router.route('/reset').get(passJwt, config.reset);

module.exports = router;
