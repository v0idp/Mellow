const { get, getURL } = require('./../util.js');

module.exports = class Tautulli {
    constructor(config) {
        this.config = config;
        this.endpoints = {
            "get_libraries" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v2?apikey=' + config.apikey + '&cmd=get_libraries'),
            "refresh_libraries_list" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v2?apikey=' + config.apikey + '&cmd=refresh_libraries_list'),
            "get_server_identity" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v2?apikey=' + config.apikey + '&cmd=get_server_identity')
        };
    }

    getLibraries() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints["get_libraries"]
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject(response);
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    refreshLibraries() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints["refresh_libraries_list"]
            }).then(() => {
                resolve();
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    getServerIdentity() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints["get_server_identity"]
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject(response);
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }
}
