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
        this.config = require(path.join(__dirname, '..', '..', 'data', 'settings.json'));
    }

    getConfig() {
        return require(path.join(__dirname, '..', '..', 'data', 'settings.json'));
    }

    resetConfigTable(table) {
        let newWebConfig = this.config;
        for (const key in template[table]) {
            newWebConfig[table][key] = template[table][key];
        }
        storeData(newWebConfig);
    }

    async saveConfig(request) {
        let newWebConfig = this.config;
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
            newWebConfig.bot.defaultservice = request.body.defaultservice;
            newWebConfig.bot.requesttv = request.body.requestTV.toLowerCase();
            newWebConfig.bot.requestmovie = request.body.requestMovie.toLowerCase();
            newWebConfig.bot.admin = request.body.admin.toLowerCase();
            newWebConfig.bot.selection = request.body.selection;
        } else if (request.originalUrl == '/ombi' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.ombi.host = request.body.host;
            newWebConfig.ombi.port = request.body.port;
            newWebConfig.ombi.baseurl = request.body.baseUrl;
            newWebConfig.ombi.apikey = request.body.apiKey;
            newWebConfig.ombi.ssl = (request.body.ssl) ? 'true' : 'false';
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
            newWebConfig.sonarr.profile = request.body.profile;
            newWebConfig.sonarr.profileanime = request.body.profileanime;
            newWebConfig.sonarr.rootfolder = request.body.rootfolder;
            newWebConfig.sonarr.rootfolderanime = request.body.rootfolderanime;
            newWebConfig.sonarr.languageprofile = request.body.languageprofile;
            newWebConfig.sonarr.seasonfolders = (request.body.seasonfolders) ? 'true' : 'false';
            newWebConfig.sonarr.v3 = (request.body.v3) ? 'true' : 'false';
            newWebConfig.sonarr.searchonrequest = (request.body.searchonrequest) ? 'true' : 'false';
        } else if (request.originalUrl == '/radarr' && request.body.apiKey != '' && request.body.host != '') {
            newWebConfig.radarr.host = request.body.host;
            newWebConfig.radarr.port = request.body.port;
            newWebConfig.radarr.baseurl = request.body.baseUrl;
            newWebConfig.radarr.apikey = request.body.apiKey;
            newWebConfig.radarr.ssl = (request.body.ssl) ? 'true' : 'false';
            newWebConfig.radarr.profile = request.body.profile;
            newWebConfig.radarr.rootfolder = request.body.rootfolder;
            newWebConfig.radarr.minimumavailability = request.body.minimumavailability;
            newWebConfig.radarr.searchonrequest = (request.body.searchonrequest) ? 'true' : 'false';
        }
        if (request.body)
            storeData(newWebConfig);
    }
}
