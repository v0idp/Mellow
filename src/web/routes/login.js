const login = require('../controllers/login.js');
const router = require('express-promise-router')();

router.route('/').get(login.render);
router.route('/').post(login.login);
router.route('/logout').get(login.logout);

module.exports = router;