const buildRadarrMovie = require('../../api/helpers/radarr.js');

const movieLookup = async (client, msg, args) => {
    return new Promise((resolve, reject) => {
        client.API.radarr.movieLookup(args.name).then((data) => {
            if (data.length > 1) {
                let fieldContent = '';
                let count = 0;
                for (let i = 0; i < data.length; i++) {
                    if (fieldContent.length > 896) break;
                    fieldContent += `${i+1}) ${data[i].title} `;
                    fieldContent += `(${data[i].year}) `;
                    fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${data[i].tmdbId})]\n`;
                    count++;
                }
            
                let movieEmbed = new Discord.MessageEmbed();
                movieEmbed.setTitle('Radarr Movie Search')
                .setDescription('Please select one of the search results. To abort answer **cancel**')
                .addField('__Search Results__', fieldContent);
                
                const aMsg = msg.embed(movieEmbed);
                msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
                .then((collected) => {
                    let message = collected.first().content;
                    let selection = parseInt(message);
                    
                    aMsg.then((m) => m.delete());
                    if (collected.first().deletable) collected.first().delete();
                    if (message.startsWith('cancel')) {
                        reject('Cancelled command.');
                    } else if (selection > 0 && selection <= count) {
                        client.API.radarr.movieLookup(`tmdb:${data[selection - 1].tmdbId}`).then((oMovie) => {
                            doesMovieExist(client, oMovie[0].tmdbId).then((status) => {
                                Object.assign(oMovie[0], { doesExist: status });
                                resolve(oMovie[0]);
                            }).catch(() => {
                                reject('There was an error in checking for movie availability.');
                            });
                        }).catch(() => {
                            reject('Something went wrong! Couldn\'t find movie.');
                        });
                    } else {
                        reject('Please enter a valid selection!');
                    }
                }).catch(() => {
                    reject('Cancelled command.');
                });
            } else if (!data.length) {
                reject('Something went wrong! Couldn\'t find any movie.');
            } else {
                client.API.radarr.movieLookup(`tmdb:${data[0].tmdbId}`).then((oMovie) => {
                    doesMovieExist(client, oMovie[0].tmdbId).then((status) => {
                        Object.assign(oMovie[0], { doesExist: status });
                        resolve(oMovie[0]);
                    }).catch(() => {
                        reject('There was an error in checking for movie availability.');
                    })
                }).catch(() => {
                    reject('Something went wrong! Couldn\'t find movie.');
                });
            }
        }).catch(() => {
            reject('Something went wrong! Couldn\'t find any movie.');
        });
    });
}

module.exports = class SonarrService {
    constructor (client) {
        this.client = client;
    }

    doesMovieExist(tmdbId) {
        return new Promise((resolve, reject) => {
            this.client.api.radarr.getMovies().then((movies) => {
                const fMovies = movies.filter((e) => e.tmdbId === tmdbId);
                if (fMovies.length > 0)
                    resolve(true);
                else
                    resolve(false);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    movieLookup(msg, searchQuery) {
        return new Promise((resolve, reject) => {
            this.client.api.radarr.movieLookup(searchQuery).then(async (data) => {
                if (data.length > 1) {
                    const aMsg = await this.client.send(msg, this.client.builder.buildRadarrMovieResults(data));
                    const selection = await this.client.awaitSelection(msg, aMsg, data.length);
    
                    aMsg.delete();

                    if (selection !== -1) {
                        this.client.api.radarr.movieLookup(`tmdb:${data[selection].tmdbId}`).then((oMovie) => {
                            this.doesMovieExist(oMovie[0].tmdbId).then((status) => {
                                Object.assign(oMovie[0], { doesExist: status });
                                resolve(oMovie[0]);
                            }).catch(() => {
                                reject('There was an error in checking for movie availability.');
                            });
                        }).catch(() => {
                            reject('Something went wrong! Couldn\'t find movie.');
                        });
                    } else {
                        reject('Please enter a valid selection!');
                    }
                } else if (!data.length) {
                    reject('Something went wrong! Couldn\'t find any movie.');
                } else {
                    this.client.api.radarr.movieLookup(`tmdb:${data[0].tmdbId}`).then((oMovie) => {
                        this.doesMovieExist(oMovie[0].tmdbId).then((status) => {
                            Object.assign(oMovie[0], { doesExist: status });
                            resolve(oMovie[0]);
                        }).catch(() => {
                            reject('There was an error in checking for movie availability.');
                        })
                    }).catch(() => {
                        reject('Something went wrong! Couldn\'t find movie.');
                    });
                }
            }).catch(() => {
                reject('Something went wrong! Couldn\'t find any movie.');
            });
        });
    }

    addMovie(msg, msgEmbed, movie) {
        const newMovie = buildRadarrMovie(movie, this.client.db.webConfig['radarr'], true);
        if (typeof newMovie === "string") {
            return this.client.reply(msg, newMovie);
        }
        if ((!this.client.config.requestmovie
            || msg.member.roles.some(role => role.name.toLowerCase() === this.client.config.requestmovie.toLowerCase()))
            && !movie.doesExist) {
            this.client.reply(msg, 'If you want to add this movie please click on the ⬇ reaction.');
            msgEmbed.react('⬇');

            this.client.awaitRequest(msg, msgEmbed).then(() => {
                this.client.api.radarr.addMovie(newMovie).then(() => {
                    return this.client.reply(msg, `Added ${movie.title} in Radarr.`);
                }).catch(() => {
                    return this.client.reply(msg, 'Something went wrong! Couldn\'t request movie.');
                });
            });
        }
    }

    async run(msg, searchQuery) {
        this.client.deleteCommandMessages(msg);
        this.movieLookup(msg, searchQuery).then(async (movie) => {
            const msgEmbed = await this.client.send(msg, this.client.builder.buildRadarrMovieEmbed(msg, movie));
            return this.addMovie(msg, msgEmbed, movie);
        }).catch((err) => {
            return this.client.reply(msg, err);
        });
    }
}
