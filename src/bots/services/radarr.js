const Discord = require('discord.js');
const path = require('path');
const buildRadarrMovie = require('../../api/helpers/radarr.js');

const outputMovie = (msg, movie) => {
    let movieEmbed = new Discord.MessageEmbed()
    .setTitle(`${movie.title} (${movie.year})`)
    .setDescription(movie.overview.substr(0, 250) + '(...)')
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setImage(movie.remotePoster)
    .setURL('https://www.themoviedb.org/movie/' + movie.tmdbId)
    .attachFiles(path.join(__dirname, '../..', 'resources', 'tmdb.png'))
    .setThumbnail('attachment://tmdb.png')
    .addField('__Status__', movie.status, true)
    .addField('__Studio__', movie.studio, true)
    .addField('__Runtime__', `${movie.runtime}min`, true);

    if (movie.doesExist) movieEmbed.addField('__Added__', '✅', true);
    if (movie.monitored) movieEmbed.addField('__Monitored__', '✅', true);

    return msg.embed(movieEmbed);
}

const doesMovieExist = (client, tmdbId) => {
    return new Promise((resolve, reject) => {
        client.API.radarr.getMovies().then((movies) => {
            const fMovies = movies.filter((e) => e.tmdbId === tmdbId);
            if (fMovies)
                resolve(true);
            else
                resolve(false);
        }).catch((err) => {
            reject(err);
        });
    });
}

const movieLookup = async (client, msg, args) => {
    return new Promise((resolve, reject) => {
        client.API.radarr.movieLookup(args.name).then((data) => {
            if (data.length > 1) {
                let fieldContent = '';
                for (let i = 0; i < 10; i++) {
                    fieldContent += `${i+1}) ${data[i].title} `;
                    fieldContent += `(${data[i].year}) `;
                    fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${data[i].tmdbId})]\n`;
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
                    } else if (selection > 0 && selection <= 10) {
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

const addMovie = (client, msg, movie, movieEmbed) => {
    const bot = client.webDatabase.webConfig['bot'];
    const newMovie = buildRadarrMovie(movie, client.webDatabase.webConfig['radarr'], true);
    if (typeof newMovie === "string") {
        return msg.reply(newMovie);
    }
    if ((!bot.requestmovie || msg.member.roles.some(role => role.name.toLowerCase() === bot.requestmovie.toLowerCase()) && !movie.doesExist)) {
        msg.reply('If you want to add this movie please click on the ⬇ reaction.');
        movieEmbed.react('⬇');
        
        movieEmbed.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 }).then(collected => {
            if (collected.first()) {
                client.API.radarr.addMovie(newMovie).then(() => {
                    return msg.reply(`Added ${movie.title} in Radarr.`);
                }).catch(() => {
                    return msg.reply('Something went wrong! Couldn\'t request movie.');
                });
            }
        }).catch(() => {
            return msg.reply('Something went wrong! Couldn\'t register your emoji.');
        });
    }
}

const executeAdd = async (client, msg, args) => {
    client.deleteCommandMessages(msg);
    movieLookup(client, msg, args).then((movie) => {
        outputMovie(msg, movie).then((movieEmbed) => {
            return addMovie(client, msg, movie, movieEmbed);
        });
    }).catch((err) => {
        return msg.reply(err);
    });
}

module.exports = executeAdd;
