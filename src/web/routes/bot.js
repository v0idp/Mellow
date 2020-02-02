const config = require('../controllers/config.js');
const bot = require('../controllers/bot.js');
const router = require('express-promise-router')();
const passport = require('passport');
const passStrats = require('../config/passport.js');
const passJwt = passport.authenticate('userJwt', { failureRedirect: '/login' });

router.route('/').post(passJwt, config.save);
router.route('/test').post(passJwt, bot.test);
router.route('/reset').get(passJwt, config.reset);

module.exports = router;
