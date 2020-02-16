module.exports = class OmbiService {
    constructor(client) {
        this.client = client;
    }

    requestSeries (msg, msgEmbed, series) {
        if ((!this.client.config.requesttv
            || msg.member.roles.some(role => role.name.toLowerCase() === this.client.config.requesttv.toLowerCase()))
            && (!series.available && !series.requested && !series.approved)) {
            this.client.reply(msg, 'If you want to request this series please click on the ⬇ reaction.');
            msgEmbed.react('⬇');
    
            this.client.awaitRequest(msg, msgEmbed).then(() => {
                this.client.api.ombi.requestTVShow(series.id, `${encodeURI(msg.author.tag)}`).then(() => {
                    return this.client.reply(msg, `Requested ${series.title} in Ombi.`);
                }).catch(() => {
                    return this.client.reply(msg, 'Cancelled command.');
                });
            });
        }
    }

    getTvDbId(msg, searchQuery) {
        return new Promise((resolve) => {
            this.client.api.ombi.searchTVShow(searchQuery).then(async (data) => {
                if (data.length > 1) {
                    const aMsg = await this.client.send(msg, this.client.builder.buildOmbiSeriesResults(this.client.config.selection, data));
                    const selection = await this.client.awaitSelection(msg, aMsg, data.length);
                    if (selection !== -1) {
                        resolve(data[selection].id);
                    } else {
                        this.client.reply(msg, 'Please enter a valid selection!');
                    }
                } else if (!data.length) {
                    this.client.reply(msg, 'Couldn\'t find the series you were looking for. Is the search query correct?');
                } else {
                    resolve(data[0].id);
                }
            }).catch(() => {
                this.client.reply(msg, 'Something went wrong! Couldn\'t find any series.');
            });
        });
    }

    async runSeries(msg, searchQuery) {
        this.client.deleteCommandMessages(msg);

        let result = null;
        if (searchQuery.startsWith('tvdb:')) {
            const matches = /^tvdb:(\d+)$/.exec(args.name);
            if (matches)
                result = matches[1];
            else
                return this.client.reply(msg, 'Please enter a valid TVDbId!');
        } else {
            result = await this.getTvDbId(msg, searchQuery);
        }

        if (typeof result === 'number') {
            this.client.api.ombi.getTVShowInformation(result).then(async (data) => {
                const msgEmbed = await this.client.send(msg, this.client.builder.buildOmbiSeriesEmbed(msg, data));
                return this.requestSeries(msg, msgEmbed, data);
            }).catch(() => {
                return this.client.reply(msg, 'Something went wrong! Couldn\'t get series information.');
            });
        }
        else {
            return this.client.reply(msg, result);
        }
    }

    requestMovie (msg, msgEmbed, movie) {
        if ((!this.client.config.requestmovie
            || msg.member.roles.some(role => role.name.toLowerCase() === this.client.config.requestmovie.toLowerCase()))
            && (!movie.available && !movie.requested && !movie.approved)) {
            this.client.reply(msg, 'If you want to request this movie please click on the ⬇ reaction.');
            msgEmbed.react('⬇');
    
            this.client.awaitRequest(msg, msgEmbed).then(() => {
                this.client.api.ombi.requestMovie(movie.theMovieDbId, `${encodeURI(msg.author.tag)}`).then(() => {
                    return this.client.reply(msg, `Requested ${movie.title} in Ombi.`);
                }).catch(() => {
                    return this.client.reply(msg, 'Cancelled command.');
                });
            });
        }
    }

    getTmDbId(msg, searchQuery) {
        return new Promise((resolve) => {
            this.client.api.ombi.searchMovie(searchQuery).then(async (data) => {
                if (data.length > 1) {
                    const aMsg = await this.client.send(msg, this.client.builder.buildOmbiMovieResults(this.client.config.selection, data));
                    const selection = await this.client.awaitSelection(msg, aMsg, data.length);
                    if (selection !== -1) {
                        resolve(data[selection].id);
                    } else {
                        this.client.reply(msg, 'Please enter a valid selection!');
                    }
                } else if (!data.length) {
                    this.client.reply(msg, 'Couldn\'t find the movie you were looking for. Is the search query correct?');
                } else {
                    resolve(data[0].id);
                }
            }).catch(() => {
                this.client.reply(msg, 'Something went wrong! Couldn\'t find any movie.');
            });
        });
    }

    async runMovie(msg, searchQuery) {
        this.client.deleteCommandMessages(msg);

        let result = null;
        if (searchQuery.startsWith('tmdb:')) {
            const matches = /^tmdb:(\d+)$/.exec(args.name);
            if (matches)
                result = matches[1];
            else
                return this.client.reply(msg, 'Please enter a valid TMDbId!');
        } else {
            result = await this.getTmDbId(msg, searchQuery);
        }

        if (typeof result === 'number') {
            this.client.api.ombi.getMovieInformation(result).then(async (data) => {
                const msgEmbed = await this.client.send(msg, this.client.builder.buildOmbiMovieEmbed(msg, data));
                return this.requestMovie(msg, msgEmbed, data);
            }).catch(() => {
                return this.client.reply(msg, 'Something went wrong! Couldn\'t get movie information.');
            });
        }
        else {
            return this.client.reply(msg, result);
        }
    }
}
