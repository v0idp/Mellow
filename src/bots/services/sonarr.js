const buildSonarrSeries = require('../../api/helpers/sonarr.js');

module.exports = class SonarrService {
    constructor (client) {
        this.client = client;
    }

    seriesLookup(msg, searchQuery) {
        return new Promise((resolve, reject) => {
            this.client.api.sonarr.seriesLookup(searchQuery).then(async (data) => {
                if (data.length > 1) {
                    const aMsg = await this.client.send(msg, this.client.builder.buildSonarrSeriesResults(this.client.config.selection, data));
                    const selection = await this.client.awaitSelection(msg, aMsg, data.length);
                    if (selection !== -1) {
                        resolve(data[selection]);
                    } else {
                        reject('Please enter a valid selection!');
                    }
                } else if (!data.length) {
                    reject('Something went wrong! Couldn\'t find any series.');
                } else {
                    resolve(data[0]);
                }
            }).catch(() => {
                reject('Something went wrong! Couldn\'t find any series.');
            });
        });
    }

    addSeries(msg, msgEmbed, series) {
        const newSeries = buildSonarrSeries(series, this.client.db.config['sonarr']);
        if (typeof newSeries === "string") {
            return this.client.reply(msg, newSeries);
        }
        if ((!this.client.config.requesttv
            || msg.member.roles.some(role => role.name.toLowerCase() === this.client.config.requesttv.toLowerCase()))
            && !series.id) {
            this.client.reply(msg, 'If you want to add this series please click on the ⬇ reaction.');
            msgEmbed.react('⬇');

            this.client.awaitRequest(msg, msgEmbed).then(() => {
                this.client.api.sonarr.addSeries(newSeries).then(() => {
                    return this.client.reply(msg, `Added ${series.title} in Sonarr.`);
                }).catch(() => {
                    return this.client.reply(msg, 'Something went wrong! Couldn\'t request series.');
                });
            });
        }
    }

    async run(msg, searchQuery) {
        this.client.deleteCommandMessages(msg);
        this.seriesLookup(msg, searchQuery).then(async (series) => {
            const msgEmbed = await this.client.send(msg, this.client.builder.buildSonarrSeriesEmbed(msg, series));
            return this.addSeries(msg, msgEmbed, series);
        }).catch((err) => {
            return this.client.reply(msg, err);
        });
    }
}
