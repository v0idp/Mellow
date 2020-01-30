const Ombi = require('../../api/ombi.js');

const test = async (req, res) => {
    const ombi = new Ombi(req.body);
    ombi.getSettingsAbout().then((result) => {
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
