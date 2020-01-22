const { get, getURL } = require('./../util.js');

module.exports = class Tautulli {
    constructor(config) {
        this.config = config;
        this.endpoints = {
            "libraries": getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v2?apikey=' + config.apikey + '&cmd=get_libraries'),
            "refresh": getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v2?apikey=' + config.apikey + '&cmd=refresh_libraries_list')
        };
    }

    getLibraries() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints["libraries"]
            }).then((response) => {
                const jsonResponse = JSON.parse(response.body);
                resolve(jsonResponse);
            }).catch((err) => {
                console.log(err);
                reject();
            });
        });
    }

    refreshLibraries() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints["refresh"]
            }).then(() => {
                resolve();
            }).catch((err) => {
                console.log(err);
                reject();
            });
        });
    }
}
