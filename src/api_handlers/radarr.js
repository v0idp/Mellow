const { get, post, getURL, replacePlaceholders } = require('./../util.js');

module.exports = class Radarr {
    constructor(config) {
        this.config = config;
        this.endpoints = {
            "getMovies" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie?apikey=${config.apikey}`),
            "getMovieByID" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie/%ID%?apikey=${config.apikey}`),
            "movieLookup" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie/lookup?term=%NAME%&apikey=${config.apikey}`)
        };
    }

    getMovies() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints['getMovies']
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

    getMovieByID(id) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['getMovieByID'], { "%ID%":id })
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

    movieLookup(name) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['movieLookup'], { "%NAME%":encodeURI(name) })
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
