module.exports = class OmbiService {
    constructor(client) {
        this.client = client;
    }

    requestSeries (msg, msgEmbed, series, wantedEpisodes) {
        if ((!this.client.config.requesttv
            || msg.member.roles.some(role => role.name.toLowerCase() === this.client.config.requesttv.toLowerCase()))
            && !this.episodesRequested(series, wantedEpisodes) && !this.episodesAvailable(series, wantedEpisodes)) {
            
            let monitoredSelectString = '';
            if(wantedEpisodes.length == 1 && wantedEpisodes[0].seasonNumber == 1) {
                monitoredSelectString = 'the first season of ';
            } else if (wantedEpisodes.length == 1 && wantedEpisodes[0].seasonNumber == series.seasonRequests.length) {
                monitoredSelectString = 'the latest season of ';
            } else if (wantedEpisodes.length == series.seasonRequests.length) {
                monitoredSelectString = 'all seasons of ';        
            }

            const filteredWantedEpisodes = this.filteredWanted(series, wantedEpisodes);

            this.client.reply(msg, `If you want to request ${monitoredSelectString}this series please click on the ⬇ reaction.`);
            msgEmbed.react('⬇');
    
            this.client.awaitRequest(msg, msgEmbed).then(() => {
                this.client.api.ombi.requestTVShow(series.id, `${encodeURI(msg.author.tag)}`, filteredWantedEpisodes).then(() => {
                    return this.client.reply(msg, `Requested ${monitoredSelectString}${series.title} in Ombi.`);
                }).catch(() => {
                    return this.client.reply(msg, 'Cancelled command.');
                });
            });
        }
    }

    episodesRequested(series, wantedEpisodes) {
        // returns false if 1+ episodes of the requested episodes is already requested in ombi

        if(!series.requested || wantedEpisodes == []) return false;

        for (const season of wantedEpisodes) {
            for (const episode of season.episodes) {
                if(!series.seasonRequests[season.seasonNumber - 1].episodes[episode.episodeNumber - 1].requested) {
                    console.log(`s${season.seasonNumber} e${episode.episodeNumber} is not requested, return false`);
                    return false;
                }
            }
        }

        return true;
    }

    episodesAvailable(series, wantedEpisodes) {
        if (series.fullyAvailable) return true;
            
        if (series.available) {
            for (const season of wantedEpisodes) {
                for (const episode of season.episodes) {
                    if(!series.seasonRequests[season.seasonNumber - 1].episodes[episode.episodeNumber - 1].available) {
                        console.log(`s${season.seasonNumber} e${episode.episodeNumber} is not available, return false`);
                        return false;
                    }
                }
            }
        } else {
            return false;
        }
    }

    filteredWanted(series, wantedEpisodes) {
        // filters out episodes that are already requested on ombi or available
        return wantedEpisodes.map(season => (
            {
                "seasonNumber": season.seasonNumber,
                "episodes": season.episodes.filter(
                    episode => (!series.seasonRequests[season.seasonNumber - 1].episodes[episode.episodeNumber - 1].requested && 
                                !series.seasonRequests[season.seasonNumber - 1].episodes[episode.episodeNumber - 1].approved)
                )
            }
        ));
    }

    async getWantedEpisodes(msg, series) {
        let requestedSeasons;

        if (this.client.db.config.ombi.wantedTvSeasons == 'ask') {
            const mMsg = await this.client.send(msg, this.client.builder.buildOmbiMonitoredSelect(this.client.config.selection));
            const selection = await this.client.awaitSelection(msg, mMsg, 3);
    
            switch(selection) {
                case 0:
                    requestedSeasons = [series.seasonRequests.length];
                    break;
                case 1:
                    requestedSeasons = [1];
                    break;
                case 2:
                    requestedSeasons = Array.from({length: series.seasonRequests.length}, (v, k) => k+1);
                    break;
            }
        } else if (this.client.db.config.ombi.wantedTvSeasons == 'alwaysFull') {
            requestedSeasons = Array.from({length: series.seasonRequests.length}, (v, k) => k+1);
        }


        const requestedEpisodes = requestedSeasons.map(season => (
            {
                "seasonNumber": season,
                "episodes": series.seasonRequests[season - 1].episodes.map(episode => ({"episodeNumber": episode.episodeNumber}))
            }
        ));

        return requestedEpisodes;
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
                const wantedEpisodes = await this.getWantedEpisodes(msg, data)

                return this.requestSeries(msg, msgEmbed, data, wantedEpisodes);
            }).catch((err) => {
                console.log(err)
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
