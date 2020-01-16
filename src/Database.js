const path = require('path');
const fs = require('fs')

const storeData = (data) => {
    try {
        fs.writeFileSync(path.join(__dirname, '..', 'data', 'settings.json'), JSON.stringify(data))
    } catch (err) {
        console.error(err)
    }
}

class Database {
    constructor() {
        this.webConfig = require(path.join(__dirname, '..', 'data', 'settings.json'));
    }

    getConfig() {
        return this.webConfig;
    }

    loadConfigTable(table) {
        return this.webConfig[table];
    }

    saveConfig(request) {
        let newWebConfig = this.webConfig;
        if (request.path == '/general') {
            newWebConfig.general.username = request.body.username;
            newWebConfig.general.password = request.body.password;
        } else if (request.path == '/bot') {
            newWebConfig.bot.token = request.body.token;
            newWebConfig.bot.ownerid = request.body.ownerID;
            newWebConfig.bot.commandprefix = request.body.commandPrefix;
            newWebConfig.bot.deletecommandmessages = (request.body.deleteCommandMessages) ? 'true' : 'false';
            newWebConfig.bot.unknowncommandresponse = (request.body.unknownCommandResponse) ? 'true' : 'false';
            newWebConfig.bot.channelname = request.body.channelName;
        } else if (request.path == '/ombi' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.ombi.host = request.body.host;
            newWebConfig.ombi.port = request.body.port;
            newWebConfig.ombi.baseurl = request.body.baseUrl;
            newWebConfig.ombi.apikey = request.body.apiKey;
            newWebConfig.ombi.ssl = (request.body.ssl) ? 'true' : 'false';
            newWebConfig.ombi.requesttv = request.body.requestTV;
            newWebConfig.ombi.requestmovie = request.body.requestMovie;
            newWebConfig.ombi.username = request.body.userName;
        } else if (request.path == '/tautulli' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.tautulli.host = request.body.host;
            newWebConfig.tautulli.port = request.body.port;
            newWebConfig.tautulli.baseurl = request.body.baseUrl;
            newWebConfig.tautulli.apikey = request.body.apiKey;
            newWebConfig.tautulli.ssl = (request.body.ssl) ? 'true' : 'false';
        } else if (request.path == '/sonarr' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.sonarr.host = request.body.host;
            newWebConfig.sonarr.port = request.body.port;
            newWebConfig.sonarr.baseurl = request.body.baseUrl;
            newWebConfig.sonarr.apikey = request.body.apiKey;
            newWebConfig.sonarr.ssl = (request.body.ssl) ? 'true' : 'false';
        } else if (request.path == '/radarr' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.radarr.host = request.body.host;
            newWebConfig.radarr.port = request.body.port;
            newWebConfig.radarr.baseurl = request.body.baseUrl;
            newWebConfig.radarr.apikey = request.body.apiKey;
            newWebConfig.radarr.ssl = (request.body.ssl) ? 'true' : 'false';
        }
        storeData(newWebConfig);
    }
}

module.exports = Database;