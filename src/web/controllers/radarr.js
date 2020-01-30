const Radarr = require('../../api/radarr.js');

const test = async (req, res) => {
    const radarr = new Radarr(req.body);
    radarr.getSystemStatus().then((result) => {
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
