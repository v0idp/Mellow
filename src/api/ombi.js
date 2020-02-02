const { get, post, getURL, replacePlaceholders } = require('./../util.js');

module.exports = class Ombi {
    constructor (config) {
        this.config = config;
        this.endpoints = {
            "/search/type/name" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/search/%TYPE%/%NAME%'),
            "/search/type/info/id" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/search/%TYPE%/info/%DBID%'),
            "/request/type" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/request/%TYPE%/'),
            "/settings/about" : getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/settings/about'),
        };
    }

    searchContent(type, name) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'ApiKey': this.config.apikey,
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['/search/type/name'], { "%TYPE%":type, "%NAME%":encodeURI(name) })
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject(response)
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    getContentInformation(type, dbid) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'ApiKey': this.config.apikey,
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['/search/type/info/id'], { "%TYPE%":type, "%DBID%":dbid })
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject(response)
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
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
                url: replacePlaceholders(this.endpoints['/request/type'], { "%TYPE%":type }),
                body: JSON.stringify(body)
            }).then(() => {
                resolve();
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    getSettingsAbout() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'ApiKey': this.config.apikey,
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['/settings/about'])
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    console.log(response);
                    reject(response)
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
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
