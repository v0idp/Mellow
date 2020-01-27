const { Router } = require('express');
const router = Router();

router.use('/', require('./routes/login'));
router.use('/login', require('./routes/login'));
router.use('/config', require('./routes/config'));
router.use('/general', require('./routes/general'));
router.use('/bot', require('./routes/bot'));
router.use('/ombi', require('./routes/ombi'));
router.use('/tautulli', require('./routes/tautulli'));
router.use('/sonarr', require('./routes/sonarr'));
router.use('/radarr', require('./routes/radarr'));

module.exports = router;
