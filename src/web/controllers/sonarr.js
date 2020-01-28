const Sonarr = require('../../api_handlers/sonarr.js');

const test = async (req, res) => {
    const sonarr = new Sonarr(req.body);
    sonarr.getSystemStatus().then((result) => {
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
