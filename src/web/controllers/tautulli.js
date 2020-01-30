const Tautulli = require('../../api/tautulli.js');

const test = async (req, res) => {
    const tautulli = new Tautulli(req.body);
    tautulli.getServerIdentity().then((result) => {
        res
        .status(200)
        .send(result);
    }).catch((err) => {
        res
        .status(500)
        .send(JSON.stringify({...{response: err}, ...{status: 'error'}}));
    });
}

module.exports = {
    test
}
