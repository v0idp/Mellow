const { get, post, getURL, replacePlaceholders } = require('./../util.js');

module.exports = class Ombi {
    constructor (config) {
        this.config = config;
        this.endpoints = {
            "searchContent" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/Search/%TYPE%/%NAME%'),
            "getContentInformation" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/Search/%TYPE%/info/%DBID%'),
            "requestContent" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/Request/%TYPE%/')
        };
    }

    searchContent(type, name) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'ApiKey': this.config.apikey,
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['searchContent'], { "%TYPE%":type, "%NAME%":encodeURI(name) })
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

    getContentInformation(type, dbid) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'ApiKey': this.config.apikey,
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['getContentInformation'], { "%TYPE%":type, "%DBID%":dbid })
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

    requestContent(type, body, name) {
        return new Promise((resolve, reject) => {
            post({
                headers: {'accept' : 'application/json',
                'Content-Type' : 'application/json',
                'ApiKey': this.config.apikey,
                'ApiAlias' : name,
                'UserName' : this.config.username ? this.config.username : 'api',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['requestContent'], { "%TYPE%":type }),
                body: JSON.stringify(body)
            }).then(() => {
                resolve();
            }).catch((err) => {
                console.log(err);
                reject();
            });
        });
    }

    searchMovie(name) {
        return this.searchContent('movie', name);
    }

    getMovieInformation(tmdbid) {
        return this.getContentInformation('movie', tmdbid);
    }

    requestMovie(tmdbid, name) {
        return this.requestContent('movie', { 'theMovieDbId': tmdbid }, name);
    }

    searchTVShow(name) {
        return this.searchContent('tv', name);
    }

    getTVShowInformation(tvdbid) {
        return this.getContentInformation('tv', tvdbid);
    }

    requestTVShow(tvdbid, name) {
        return this.requestContent('tv', { 'tvDbId': tvdbid, "requestAll": true}, name);
    }
}
