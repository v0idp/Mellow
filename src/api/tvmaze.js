const { get, replacePlaceholders } = require('./../util.js');

module.exports = class TVMaze {
    constructor() {
        this.endpoints = {
            "/shows" : "http://api.tvmaze.com/shows/%ID%"
        };
    }

    isAnime(id) {
        return new Promise((resolve, reject) => {
            get({
                headers: {'accept' : 'application/json',
                'User-Agent': `Mellow/${process.env.npm_package_version}`},
                url: replacePlaceholders(this.endpoints['/shows'], { "%ID%":id })
            }).then(({response, body}) => {
                if (response.statusCode === 200) {
                    const data = JSON.parse(body);
                    const isAnime = data.genres.some((genre) => genre.toLowerCase() === 'anime');
                    resolve(isAnime);
                }
                else {
                    reject(response);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
}
