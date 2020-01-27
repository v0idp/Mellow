const path = require('path');
const fs = require('fs');
const template = require('./settings_format.json');
const bcrypt = require('bcryptjs');

const storeData = (data) => {
    try {
        fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'settings.json'), JSON.stringify(data))
    } catch (err) {
        console.error(err)
    }
}

module.exports = class Database {
    constructor() {
        this.webConfig = require(path.join(__dirname, '..', '..', 'data', 'settings.json'));
    }

    getConfig() {
        return require(path.join(__dirname, '..', '..', 'data', 'settings.json'));
    }

    resetConfigTable(table) {
        let newWebConfig = require(path.join(__dirname, '..', '..', 'data', 'settings.json'));
        for (const key in template[table]) {
            newWebConfig[table][key] = template[table][key];
        }
        storeData(newWebConfig);
    }

    async saveConfig(request) {
        let newWebConfig = require(path.join(__dirname, '..', '..', 'data', 'settings.json'));
        if (request.originalUrl == '/general') {
            const salt = await bcrypt.genSalt(10);
            const pwHash = await bcrypt.hash(request.body.password, salt);
            newWebConfig.general.username = request.body.username;
            newWebConfig.general.password = pwHash;
        } else if (request.originalUrl == '/bot') {
            newWebConfig.bot.token = request.body.token;
            newWebConfig.bot.ownerid = request.body.ownerID;
            newWebConfig.bot.commandprefix = request.body.commandPrefix;
            newWebConfig.bot.deletecommandmessages = (request.body.deleteCommandMessages) ? 'true' : 'false';
            newWebConfig.bot.unknowncommandresponse = (request.body.unknownCommandResponse) ? 'true' : 'false';
            newWebConfig.bot.channelname = request.body.channelName;
        } else if (request.originalUrl == '/ombi' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.ombi.host = request.body.host;
            newWebConfig.ombi.port = request.body.port;
            newWebConfig.ombi.baseurl = request.body.baseUrl;
            newWebConfig.ombi.apikey = request.body.apiKey;
            newWebConfig.ombi.ssl = (request.body.ssl) ? 'true' : 'false';
            newWebConfig.ombi.requesttv = request.body.requestTV.toLowerCase();
            newWebConfig.ombi.requestmovie = request.body.requestMovie.toLowerCase();
            newWebConfig.ombi.username = request.body.userName.toLowerCase();
        } else if (request.originalUrl == '/tautulli' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.tautulli.host = request.body.host;
            newWebConfig.tautulli.port = request.body.port;
            newWebConfig.tautulli.baseurl = request.body.baseUrl;
            newWebConfig.tautulli.apikey = request.body.apiKey;
            newWebConfig.tautulli.ssl = (request.body.ssl) ? 'true' : 'false';
        } else if (request.originalUrl == '/sonarr' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.sonarr.host = request.body.host;
            newWebConfig.sonarr.port = request.body.port;
            newWebConfig.sonarr.baseurl = request.body.baseUrl;
            newWebConfig.sonarr.apikey = request.body.apiKey;
            newWebConfig.sonarr.ssl = (request.body.ssl) ? 'true' : 'false';
        } else if (request.originalUrl == '/radarr' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.radarr.host = request.body.host;
            newWebConfig.radarr.port = request.body.port;
            newWebConfig.radarr.baseurl = request.body.baseUrl;
            newWebConfig.radarr.apikey = request.body.apiKey;
            newWebConfig.radarr.ssl = (request.body.ssl) ? 'true' : 'false';
        }
        storeData(newWebConfig);
    }
}
