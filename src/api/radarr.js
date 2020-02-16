const { get, post, getURL, replacePlaceholders } = require('./../util.js');

module.exports = class Radarr {
    constructor(config) {
        this.config = config;
        this.endpoints = {
            "/movie" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie?apikey=${config.apikey}`),
            "/movie/id" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie/%ID%?apikey=${config.apikey}`),
            "/movie/lookup" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie/lookup?term=%NAME%&apikey=${config.apikey}`),
            "/movie/lookup/tmdb" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/movie/lookup/tmdb?tmdbId=%NAME%&apikey=${config.apikey}`),
            "/profile" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/profile?apikey=${config.apikey}`),
            "/rootfolder" : getURL(config.host, config.port, config.ssl, config.baseurl + `/api/rootfolder?apikey=${config.apikey}`),
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
            let endpoint = '/movie/lookup';
            let search = name;
            if (name.startsWith('tmdb:')) {
                endpoint += '/tmdb';
                search = name.replace('tmdb:', '');
            }

            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints[endpoint], { "%NAME%":encodeURI(search) })
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    if (data.length !== 0) resolve(data);
                    else reject(response);
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

    getProfiles() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints['/profile']
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    reject(response);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    getProfileByID(id) {
        return new Promise((resolve, reject) => {
            this.getProfiles().then((profiles) => {
                for (let i = 0; i < profiles.length; i++) {
                    if (profiles[i].id === id) {
                        resolve(profiles[i]);
                    }
                }
                console.log(`profile ID: ${id} not found.`);
                reject(`profile ID: ${id} not found.`);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    getRootFolders() {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints['/rootfolder']
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    resolve(data);
                }
                else {
                    reject(response);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    getRootFolderByID(id) {
        return new Promise((resolve, reject) => {
            this.getRootFolders().then((rootfolders) => {
                for (let i = 0; i < rootfolders.length; i++) {
                    if (rootfolders[i].id === id) {
                        resolve(rootfolders[i]);
                    }
                }
                console.log(`rootfolder ID: ${id} not found.`);
                reject(`rootfolder ID: ${id} not found.`);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    addMovie(newMovie) {
        return new Promise((resolve, reject) => {
            post({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: this.endpoints['/movie'],
                body: JSON.stringify(newMovie)
            }).then(({response, body}) => {
                if (response.statusCode === 201) {
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
