const { get, post, getURL, replacePlaceholders } = require('./../util.js');

module.exports = class Sonarr {
    constructor(config) {
        this.config = config;
        this.endpoints = {
            "getSeries" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/series?apikey=${config.apikey}`),
            "getSeriesByID" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/series/%ID%?apikey=${config.apikey}`),
            "seriesLookup" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/series/lookup?term=%NAME%&apikey=${config.apikey}`)
        };
    }

    getSeries() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints['getSeries']
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject()
                }
            }).catch((err) => {
                console.log(err);
                reject();
            });
        });
    }

    getSeriesByID(id) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['getSeriesByID'], { "%ID%":id })
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject()
                }
            }).catch((err) => {
                console.log(err);
                reject();
            });
        });
    }

    seriesLookup(name) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['seriesLookup'], { "%NAME%":encodeURI(name) })
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject()
                }
            }).catch((err) => {
                console.log(err);
                reject();
            });
        });
    }
}
