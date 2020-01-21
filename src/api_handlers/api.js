const Ombi = require('./ombi.js');
const Radarr = require('./radarr.js');
const Sonarr = require('./sonarr.js');
const Tautulli = require('./tautulli.js');

class APIHandler {
    constructor (config) {
        this.ombi = new Ombi(config);
        this.radarr = new Radarr(config);
        this.sonarr = new Sonarr(config);
        this.tautulli = new Tautulli(config);
    }
}

module.exports = APIHandler;