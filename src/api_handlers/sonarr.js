const { get, post, getURL, replacePlaceholders } = require('./../util.js');

module.exports = class Sonarr {
    constructor(config) {
        this.config = config;
        this.endpoints = {
            "seriesLookup" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/series/lookup?term=%NAME%&apikey=${config.apikey}`)
        };
    }

    seriesLookup(name) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'ApiKey': this.config.apikey,
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
