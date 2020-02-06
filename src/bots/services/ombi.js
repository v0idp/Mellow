const Discord = require('discord.js');
const path = require('path');

const outputMovie = (msg, movie) => {
    let movieEmbed = new Discord.MessageEmbed()
    .setTitle(`${movie.title} ${(movie.releaseDate) ? `(${movie.releaseDate.split('T')[0].substring(0,4)})` : ''}`)
    .setDescription(movie.overview.substr(0, 250) + '(...)')
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setImage('https://image.tmdb.org/t/p/w500' + movie.posterPath)
    .setURL('https://www.themoviedb.org/movie/' + movie.theMovieDbId)
    .attachFiles(path.join(__dirname, '../..', 'resources', 'tmdb.png'))
    .setThumbnail('attachment://tmdb.png');

    if (movie.available) movieEmbed.addField('__Available__', '✅', true);
    if (movie.quality) movieEmbed.addField('__Quality__', `${movie.qualityp}p` , true);
    if (movie.requested) movieEmbed.addField('__Requested__', '✅', true);
    if (movie.approved) movieEmbed.addField('__Approved__', '✅', true);
    if (movie.plexUrl) movieEmbed.addField('__Plex__', `[Watch now](${movie.plexUrl})`, true);
    if (movie.embyUrl) movieEmbed.addField('__Emby__', `[Watch now](${movie.embyUrl})`, true);

    return msg.embed(movieEmbed);
}

const outputTVShow = (msg, show) => {
    let tvEmbed = new Discord.MessageEmbed()
    .setTitle(`${show.title} ${(show.firstAired) ? `(${show.firstAired.substring(0,4)})` : ''}`)
    .setDescription(show.overview.substr(0, 250) + '(...)')
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setImage(show.banner)
    .setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
    .attachFiles(path.join(__dirname, '../..', 'resources', 'tvdb.png'))
    .setThumbnail('attachment://tvdb.png')
    .addField('__Network__', show.network, true)
    .addField('__Status__', show.status, true);

    if (show.available) tvEmbed.addField('__Available__', '✅', true);
    if (show.quality) tvEmbed.addField('__Quality__', show.quality, true);
    if (show.requested) tvEmbed.addField('__Requested__', '✅', true);
    if (show.approved) tvEmbed.addField('__Approved__', '✅', true);
    if (show.plexUrl) tvEmbed.addField('__Plex__', `[Watch now](${show.plexUrl})`, true);
    if (show.embyUrl) tvEmbed.addField('__Emby__', `[Watch now](${show.embyUrl})`, true);

    return msg.embed(tvEmbed);
}

const getTMDbID = (client, msg, name) => {
    return new Promise((resolve) => {
        client.API.ombi.searchMovie(name).then((data) => {
            if (data.length > 1) {
                let fieldContent = '';
                let count = 0;
                for (let i = 0; i < data.length; i++) {
                    if (fieldContent.length > 896) break;
                    fieldContent += `${i+1}) ${data[i].title} `;
                    if (data[i].releaseDate) fieldContent += `(${data[i].releaseDate.substring(0,4)}) `;
                    fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${data[i].theMovieDbId})]\n`;
                    count++;
                }
            
                let showEmbed = new Discord.MessageEmbed();
                showEmbed.setTitle('Ombi Movie Search')
                .setDescription('Please select one of the search results. To abort answer **cancel**')
                .addField('__Search Results__', fieldContent);
                
                const aMsg = msg.embed(showEmbed);
                msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
                .then((collected) => {
                    let message = collected.first().content;
                    let selection = parseInt(message);
                    
                    aMsg.then((m) => m.delete());
                    if (collected.first().deletable) collected.first().delete();
                    if (message.startsWith('cancel')) {
                        msg.reply('Cancelled command.');
                    } else if (selection > 0 && selection <= count) {
                        resolve(data[selection - 1].id);
                    } else {
                        msg.reply('Please enter a valid selection!');
                    }
                }).catch(() => {
                    msg.reply('Cancelled command.');
                });
            } else if (!data.length) {
                msg.reply('Couldn\'t find the movie you were looking for. Is the name correct?');
            } else {
                resolve(data[0].id);
            }
        }).catch(() => {
            msg.reply('Something went wrong! Couldn\'t find any movie.');
        });
    });
}

const getTVDbID = (client, msg, name) => {
    return new Promise((resolve) => {
        client.API.ombi.searchTVShow(name).then((data) => {
            if (data.length > 1) {
                let fieldContent = '';
                data.forEach((show, i) => {
                    fieldContent += `${i+1}) ${show.title} `;
                    if (show.firstAired) fieldContent += `(${show.firstAired.substring(0,4)}) `;
                    fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${show.id}&tab=series)]\n`;
                });
            
                let showEmbed = new Discord.MessageEmbed();
                showEmbed.setTitle('Ombi TV Show Search')
                .setDescription('Please select one of the search results. To abort answer **cancel**')
                .addField('__Search Results__', fieldContent);
                
                const aMsg = msg.embed(showEmbed);
                msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
                .then((collected) => {
                    let message = collected.first().content;
                    let selection = parseInt(message);
                    
                    aMsg.then((m) => m.delete());
                    if (collected.first().deletable) collected.first().delete();
                    if (message.startsWith('cancel')) {
                        msg.reply('Cancelled command.');
                    } else if (selection > 0 && selection <= data.length) {
                        resolve(data[selection - 1].id);
                    } else {
                        msg.reply('Please enter a valid selection!');
                    }
                }).catch(() => {
                    msg.reply('Cancelled command.');
                });
            } else if (!data.length) {
                msg.reply('Couldn\'t find the tv show you were looking for. Is the name correct?');
            } else {
                resolve(data[0].id);
            }
        }).catch(() => {
            msg.reply('Something went wrong! Couldn\'t find any tv show.');
        });
    });
}

const requestMovie = (client, msg, movieMsg, movie) => {
    const bot = client.webDatabase.webConfig['bot'];
    if ((!bot.requestmovie || msg.member.roles.some(role => role.name.toLowerCase() === bot.requestmovie.toLowerCase())) && (!movie.available && !movie.requested && !movie.approved)) {
        msg.reply('If you want to request this movie please click on the ⬇ reaction.');
        movieMsg.react('⬇');
        
        movieMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 }).then(collected => {
            if (collected.first()) {
                client.API.ombi.requestMovie(movie.theMovieDbId, `${encodeURI(msg.author.username.toLowerCase())}#${msg.author.discriminator}`).then(() => {
                    return msg.reply(`Requested ${movie.title} in Ombi.`);
                }).catch(() => {
                    return msg.reply('Something went wrong! Couldn\'t request movie.');
                });
            }
        }).catch(() => {
            return msg.reply('Something went wrong! Couldn\'t register your emoji.');
        });
    }
    return movieMsg;
}

const requestTVShow = (client, msg, showMsg, show) => {
    const bot = client.webDatabase.webConfig['bot'];
    if ((!bot.requesttv || msg.member.roles.some(role => role.name.toLowerCase() === bot.requesttv.toLowerCase())) && (!show.available && !show.requested && !show.approved)) {
        msg.reply('If you want to request this tv show please click on the ⬇ reaction.');
        showMsg.react('⬇');
        
        showMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 }).then(collected => {
            if (collected.first()) {
                client.API.ombi.requestTVShow(show.id, `${encodeURI(msg.author.username.toLowerCase())}#${msg.author.discriminator}`).then(() => {
                    return msg.reply(`Requested ${show.title} in Ombi.`);
                }).catch(() => {
                    return msg.reply('Something went wrong! Couldn\'t request tv show.');
                });
            }
        }).catch(() => {
            return msg.reply('Something went wrong! Couldn\'t register your emoji.');
        });
    }
    return showMsg;
}

const executeMovie = async (client, msg, args) => {
    client.deleteCommandMessages(msg);
    if (!args.name) {
        return msg.reply('Please enter a valid movie name.');
    }

    let tmdbid = undefined;
    if (args.name.startsWith("tmdb:")) {
        const matches = /^tmdb:(\d+)$/.exec(args.name);
        if (matches) {
            tmdbid = matches[1];
        } else {
            return msg.reply('Please enter a valid TMDb ID!');
        }
    } else {
        tmdbid = await getTMDbID(client, msg, args.name);
    }

    if (tmdbid) {
        client.API.ombi.getMovieInformation(tmdbid).then((data) => {
            outputMovie(msg, data).then((dataMsg) => {
                requestMovie(client, msg, dataMsg, data);
            });
        }).catch(() => {
            return msg.reply('Something went wrong! Couldn\'t get movie information.');
        });
    }
}

const executeTV = async (client, msg, args) => {
    client.deleteCommandMessages(msg);
    if (!args.name) {
        return msg.reply('Please enter a valid tv show name.');
    }

    let tvdbid = undefined;
    if (args.name.startsWith("tvdb:")) {
        const matches = /^tvdb:(\d+)$/.exec(args.name);
        if (matches) {
            tvdbid = matches[1];
        } else {
            return msg.reply('Please enter a valid TVDb ID!');
        }
    } else {
        tvdbid = await getTVDbID(client, msg, args.name);
    }

    if (tvdbid) {
        client.API.ombi.getTVShowInformation(tvdbid).then((data) => {
            outputTVShow(msg, data).then((dataMsg) => {
                requestTVShow(client, msg, dataMsg, data);
            });
        }).catch(() => {
            return msg.reply('Something went wrong! Couldn\'t get tv show information.');
        });
    }
}

module.exports = {
    executeMovie,
    executeTV
}
