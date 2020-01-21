const Ombi = require('./ombi.js');
const Radarr = require('./radarr.js');
const Sonarr = require('./sonarr.js');
const Tautulli = require('./tautulli.js');

class APIHandler {
    constructor (config) {
        this.ombi = new Ombi(config.ombi);
        this.radarr = new Radarr(config.radarr);
        this.sonarr = new Sonarr(config.sonarr);
        this.tautulli = new Tautulli(config.tautulli);
    }
}

module.exports = APIHandler;