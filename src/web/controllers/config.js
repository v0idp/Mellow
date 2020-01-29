const { ucwords } = require('../../util.js');
const Sonarr = require('../../api_handlers/sonarr.js');
const Radarr = require('../../api_handlers/radarr.js');

const render = async (req, res) => {
    const config = req.webserver.WebDatabase.webConfig;
    sonarr = new Sonarr(config['sonarr']);
    radarr = new Radarr(config['radarr']);

    sonarrProfiles = await sonarr.getProfiles().catch(() => {});
    radarrProfiles = await radarr.getProfiles().catch(() => {});
    sonarrRootFolders = await sonarr.getRootFolders().catch(() => {});
    radarrRootFolders = await radarr.getRootFolders().catch(() => {});
    
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
        radarrSettings:  (config.radarr) ? config.radarr : '',
        profiles: {
            sonarr: (sonarrProfiles) ? sonarrProfiles : undefined,
            radarr: (radarrProfiles) ? radarrProfiles : undefined
        },
        rootfolders: {
            sonarr: (sonarrRootFolders) ? sonarrRootFolders : undefined,
            radarr: (radarrRootFolders) ? radarrRootFolders : undefined
        }
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

module.exports = {
    render,
    save,
    reset
}
