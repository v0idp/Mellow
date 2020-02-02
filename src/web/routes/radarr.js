const config = require('../controllers/config.js');
const radarr = require('../controllers/radarr.js');
const router = require('express-promise-router')();
const passport = require('passport');
const passStrats = require('../config/passport.js');
const passJwt = passport.authenticate('userJwt', { failureRedirect: '/login' });

router.route('/').post(passJwt, config.save);
router.route('/test').post(passJwt, radarr.test);
router.route('/reset').get(passJwt, config.reset);

module.exports = router;
