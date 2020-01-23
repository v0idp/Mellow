const Discord = require('discord.js');
const commando = require('discord.js-commando');
const path = require('path');

module.exports = class searchMovieCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'movie',
			'memberName': 'movie',
			'group': 'ombi',
			'description': 'Search and Request Movies in Ombi',
			'examples': ['movie The Matrix', 'movie tmdb:603'],
			'guildOnly': true,
			'argsPromptLimit': 0,
			'args': [
				{
					'key': 'name',
					'prompt': 'Name of the Movie',
					'type': 'string'
				}
			]
		});
	}

	outputMovie(msg, movie) {
		let movieEmbed = new Discord.MessageEmbed()
		.setTitle(`${movie.title} ${(movie.releaseDate) ? `(${movie.releaseDate.split('T')[0].substring(0,4)})` : ''}`)
		.setDescription(movie.overview.substr(0, 255) + '(...)')
		.setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
		.setTimestamp(new Date())
		.setImage('https://image.tmdb.org/t/p/w500' + movie.posterPath)
		.setURL('https://www.themoviedb.org/movie/' + movie.theMovieDbId)
		.attachFiles(path.join(__dirname, '..', '..', 'resources', 'tmdb.png'))
		.setThumbnail('attachment://tmdb.png');
	
		if (movie.available) movieEmbed.addField('__Available__', '✅', true);
		if (movie.quality) movieEmbed.addField('__Quality__', `${movie.qualityp}p` , true);
		if (movie.requested) movieEmbed.addField('__Requested__', '✅', true);
		if (movie.approved) movieEmbed.addField('__Approved__', '✅', true);
		if (movie.plexUrl) movieEmbed.addField('__Plex__', `[Watch now](${movie.plexUrl})`, true);
		if (movie.embyUrl) movieEmbed.addField('__Emby__', `[Watch now](${movie.embyUrl})`, true);
	
		return msg.embed(movieEmbed);
	}
	
	getTMDbID(msg, name) {
		return new Promise((resolve) => {
			this.client.API.ombi.searchMovie(name).then((data) => {
				if (data.length > 1) {
					let fieldContent = '';
					data.forEach((movie, i) => {
						fieldContent += `${i+1}) ${movie.title} `
						if (movie.releaseDate) fieldContent += `(${movie.releaseDate.substring(0,4)}) `
						fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${movie.theMovieDbId})]\n`
					})
				
					let showEmbed = new Discord.MessageEmbed();
					showEmbed.setTitle('Ombi Movie Search')
					.setDescription('Please select one of the search results. To abort answer **cancel**')
					.addField('__Search Results__', fieldContent);
					
					const aMsg = msg.embed(showEmbed);
					msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
					.then((collected) => {
						let message = collected.first().content;
						let selection = parseInt(message);
						
						aMsg.then(this.client.deleteCommandMessages);
						this.client.deleteCommandMessages(collected.first());
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
					msg.reply('Couldn\'t find the movie you were looking for. Is the name correct?');
				} else {
					resolve(data[0].id);
				}
			}).catch(() => {
				msg.reply('Something went wrong! Couldn\'t find any movie.');
			});
		});
	}
	
	requestMovie(msg, movieMsg, movie) {
		const ombi = this.client.webDatabase.loadConfigTable('ombi');
		if ((!ombi.requestmovie || msg.member.roles.some(role => role.name.toLowerCase() === ombi.requestmovie.toLowerCase())) && (!movie.available && !movie.requested && !movie.approved)) {
			msg.reply('If you want to request this movie please click on the ⬇ reaction.');
			movieMsg.react('⬇');
			
			movieMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 }).then(collected => {
				if (collected.first()) {
					this.client.API.ombi.requestMovie(movie.theMovieDbId, `${encodeURI(msg.author.username.toLowerCase())}#${msg.author.discriminator}`).then(() => {
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

	async run (msg, args) {
		this.client.deleteCommandMessages(msg);
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
			tmdbid = await this.getTMDbID(msg, args.name);
		}

		if (tmdbid) {
			this.client.API.ombi.getMovieInformation(tmdbid).then((data) => {
				this.outputMovie(msg, data).then((dataMsg) => {
					this.requestMovie(msg, dataMsg, data);
				});
			}).catch(() => {
				return msg.reply('Something went wrong! Couldn\'t get movie information.');
			});
		}
	}
};
