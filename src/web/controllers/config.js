const { get, getURL, ucwords } = require('../../util.js');

const render = async (req, res) => {
    const config = req.webserver.WebDatabase.webConfig;
    res.status(200)
    .render('config', {
        title: 'Mellow Configuration',
        successMsg: req.webserver.successMsg,
        errorMsg: req.webserver.errorMsg,
        currentView: req.webserver.currentView,
        generalSettings: (config.general) ? config.general : '',
        botSettings: (config.bot) ? config.bot : '',
        ombiSettings:  (config.ombi) ? config.ombi : '',
        tautulliSettings:  (config.tautulli) ? config.tautulli : '',
        sonarrSettings:  (config.sonarr) ? config.sonarr : '',
        radarrSettings:  (config.radarr) ? config.radarr : ''
    });
}

const save = async (req, res) => {
    await req.webserver.WebDatabase.saveConfig(req);
    req.webserver.restartBot();
    req.webserver.currentView = req.originalUrl.replace('/', '');
    req.webserver.successMsg = ucwords(req.webserver.currentView) + ' configuration saved.';
    res.redirect('/config');
}

const reset = async (req, res) => {
    req.webserver.WebDatabase.resetConfigTable(req.originalUrl.split('/')[1]);
    req.webserver.restartBot();
    req.webserver.currentView = req.originalUrl.split('/')[1];
    req.webserver.successMsg = ucwords(req.webserver.currentView) + ' configuration reset.';
    res.redirect('/config');
}

const test = async (req, res) => {
    let config = req.body;
    let url;
    let apiHeader = {};

    switch (req.originalUrl.split('/')[1]) {
        case "ombi":
            apiHeader = {'ApiKey': config.apikey};
            url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/Search/movie/popular');
            break;
        case "tautulli":
            url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v2?apikey=' + config.apikey + '&cmd=status');
            break;
        case "sonarr":
            url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/system/status?apikey=' + config.apikey);
            console.log(url);
            break;
        case "radarr":
            url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/system/status?apikey=' + config.apikey);
            break;
        default:
            res.status(500).send(JSON.stringify({'status': 'error'}));
            break;
    }

    if (url) {
        const defaultHeaders = {
            'accept': 'application/json',
            'User-Agent': `Mellow/${process.env.npm_package_version}`
        };

        const requestHeaders = {...defaultHeaders, ...apiHeader};

        get({
            headers: requestHeaders,
            url: url
        }).then((resolve) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                JSON.parse(resolve.body);
                res.send(resolve.body);
            } catch (error) {
                res.status(500).send(JSON.stringify({...{response: error}, ...{status: 'error'}}));
            }
        }).catch((error) => {
            res.status(500).send(JSON.stringify({...{response: error}, ...{status: 'error'}}));
        });
    }
}

module.exports = {
    render,
    save,
    reset,
    test
}
