const { get, post, getURL, replacePlaceholders } = require('./../util.js');

module.exports = class Radarr {
    constructor(config) {
        this.config = config;
        this.endpoints = {
            "/movie" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie?apikey=${config.apikey}`),
            "/movie/id" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie/%ID%?apikey=${config.apikey}`),
            "/movie/lookup" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie/lookup?term=%NAME%&apikey=${config.apikey}`),
            "/system/status" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/system/status?apikey=${config.apikey}`)
        };
    }

    getMovies() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints['/movie']
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

    getMovieByID(id) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['/movie/id'], { "%ID%":id })
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

    movieLookup(name) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['/movie/lookup'], { "%NAME%":encodeURI(name) })
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

    getSystemStatus() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints['/system/status']
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
