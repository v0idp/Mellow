const Discord = require('discord.js');
const path = require('path');
const buildSonarrSeries = require('../../api/helpers/sonarr.js');

const outputSeries = (msg, series) => {
    let seriesEmbed = new Discord.MessageEmbed()
    .setTitle(`${series.title} (${series.year})`)
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setImage(series.remotePoster)
    .setURL(`https://www.thetvdb.com/?id=${series.tvdbId}&tab=series`)
    .attachFiles(path.join(__dirname, '../..', 'resources', 'tvdb.png'))
    .setThumbnail('attachment://tvdb.png')
    .addField('__Network__', series.network, true)
    .addField('__Status__', series.status, true)
    .addField('__Seasons__', series.seasonCount, true)

    if (series.overview) seriesEmbed.setDescription(series.overview.substr(0, 250) + '(...)');
    if (series.certification) seriesEmbed.addField('__Certification__', series.certification, true);
    if (series.id) seriesEmbed.addField('__Added__', '✅', true);

    return msg.embed(seriesEmbed);
}

const seriesLookup = async (client, msg, args) => {
    return new Promise((resolve, reject) => {
        client.API.sonarr.seriesLookup(args.name).then((data) => {
            if (data.length > 1) {
                let fieldContent = '';
                for (let i = 0; i < 10; i++) {
                    fieldContent += `${i+1}) ${data[i].title} `;
                    fieldContent += `(${data[i].year}) `;
                    fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${data[i].tvdbId}&tab=series)]\n`;
                }
            
                let seriesEmbed = new Discord.MessageEmbed();
                seriesEmbed.setTitle('Sonarr Series Search')
                .setDescription('Please select one of the search results. To abort answer **cancel**')
                .addField('__Search Results__', fieldContent);
                
                const aMsg = msg.embed(seriesEmbed);
                msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
                .then((collected) => {
                    let message = collected.first().content;
                    let selection = parseInt(message);
                    
                    aMsg.then((m) => m.delete());
                    if (collected.first().deletable) collected.first().delete();
                    if (message.startsWith('cancel')) {
                        reject('Cancelled command.');
                    } else if (selection > 0 && selection <= 10) {
                        resolve(data[selection - 1]);
                    } else {
                        reject('Please enter a valid selection!');
                    }
                }).catch(() => {
                    reject('Cancelled command.');
                });
            } else if (!data.length) {
                reject('Something went wrong! Couldn\'t find any tv show.');
            } else {
                resolve(data[0]);
            }
        }).catch(() => {
            reject('Something went wrong! Couldn\'t find any tv show.');
        });
    });
}

const addSeries = (client, msg, series, seriesEmbed) => {
    const bot = client.webDatabase.webConfig['bot'];
    const newSeries = buildSonarrSeries(series, client.webDatabase.webConfig['sonarr']);
    if (typeof newSeries === "string") {
        return msg.reply(newSeries);
    }
    if ((!bot.requesttv || msg.member.roles.some(role => role.name.toLowerCase() === bot.requesttv.toLowerCase())) && !series.id) {
        msg.reply('If you want to add this series please click on the ⬇ reaction.');
        seriesEmbed.react('⬇');
        
        seriesEmbed.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 }).then(collected => {
            if (collected.first()) {
                client.API.sonarr.addSeries(newSeries).then(() => {
                    return msg.reply(`Added ${series.title} in Sonarr.`);
                }).catch(() => {
                    return msg.reply('Something went wrong! Couldn\'t request series.');
                });
            }
        }).catch(() => {
            return msg.reply('Something went wrong! Couldn\'t register your emoji.');
        });
    }
}

const executeAdd = async (client, msg, args) => {
    client.deleteCommandMessages(msg);
    seriesLookup(client, msg, args).then((series) => {
        outputSeries(msg, series).then((seriesEmbed) => {
            return addSeries(client, msg, series, seriesEmbed);
        });
    }).catch((err) => {
        return msg.reply(err);
    });
}

module.exports = executeAdd;
