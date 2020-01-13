const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {checkURLPrefix, deleteCommandMessages, get, post} = require('../../util.js');

function outputMovie(msg, movie) {
	let movieEmbed = new Discord.MessageEmbed()
	.setTitle(`${movie.title} ${(movie.releaseDate) ? `(${movie.releaseDate.split('T')[0].substring(0,4)})` : ''}`)
	.setDescription(movie.overview.substr(0, 255) + '(...)')
	.setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
	.setTimestamp(new Date())
	.setImage('https://image.tmdb.org/t/p/w500' + movie.posterPath)
	.setURL('https://www.themoviedb.org/movie/' + movie.theMovieDbId)
	.setThumbnail('https://i.imgur.com/EQhANAP.png');

	if (movie.available) movieEmbed.addField('__Available__', '✅', true);
	if (movie.quality) movieEmbed.addField('__Quality__', movie.quality, true);
	if (movie.requested) movieEmbed.addField('__Requested__', '✅', true);
	if (movie.approved) movieEmbed.addField('__Approved__', '✅', true);
	if (movie.plexUrl) movieEmbed.addField('__Plex__', `[Watch now](${movie.plexUrl})`, true);
	if (movie.embyUrl) movieEmbed.addField('__Emby__', `[Watch now](${movie.embyUrl})`, true);

	return msg.embed(movieEmbed);
}

function getTMDbID(ombi, msg, name) {
	return new Promise((resolve, reject) => {
		get({
			headers: {'accept' : 'application/json',
			'ApiKey': ombi.apikey,
            'User-Agent': `Mellow/${process.env.npm_package_version}`},
			url: (checkURLPrefix(ombi.host) ? ombi.host : `http://${ombi.host}`) + (ombi.port ? `:${ombi.port}` : '') + '/api/v1/Search/movie/' +name 
		}).then(({response, body}) => {
			let data = JSON.parse(body)

			if (data.length > 1) {
				let fieldContent = '';
				data.forEach((movie, i) => {
					fieldContent += `${i+1}) ${movie.title} `
					if (movie.releaseDate) fieldContent += `(${movie.releaseDate.substring(0,4)}) `
					fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${movie.theMovieDbId})]\n`
				})
			
				let showEmbed = new Discord.MessageEmbed()
				showEmbed.setTitle('Ombi Movie Search')
				.setDescription('Please select one of the search results. To abort answer **cancel**')
				.addField('__Search Results__', fieldContent);
				msg.embed(showEmbed);
		
				msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
				.then((collected) => {
					let message = collected.first().content
					let selection = parseInt(message)
		
					if (message.startsWith('cancel')) {
						msg.reply('Cancelled command.');
					} else if (selection > 0 && selection <= data.length) {
						return resolve(data[selection - 1].id)
					} else {
						msg.reply('Please enter a valid selection!')
					}
					return resolve()
				})
				.catch((collected) => {
					msg.reply('Cancelled command.');
					return resolve()
				});
			} else if (!data.length) {
				msg.reply('Couldn\'t find the movie you were looking for. Is the name correct?');
				return resolve()
			} else {
				return resolve(data[0].id)
			}
		})
		.catch((error) => {
			console.error(error);
			return msg.reply('There was an error in your request.');
		})
	})
}

function requestMovie(ombi, msg, movieMsg, movie) {
	if ((!ombi.requestmovie || msg.member.roles.some(role => role.name === ombi.requestmovie)) && (!movie.available && !movie.requested && !movie.approved)) {
		msg.reply('If you want to request this movie please click on the ⬇ reaction.');
		movieMsg.react('⬇');
		
		movieMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 })
		.then(collected => {
			if (collected.first()) {
				post({
					headers: {'accept' : 'application/json',
					'Content-Type' : 'application/json',
					'ApiKey': ombi.apikey,
					'ApiAlias' : `${msg.author.username}#${msg.author.discriminator}`,
					'UserName' : ombi.username ? ombi.username : undefined,
					'User-Agent': `Mellow/${process.env.npm_package_version}`},
					url: (checkURLPrefix(ombi.host) ? ombi.host : (ombi.port) ? ombi.host + ':' + ombi.port : 'http://' + ombi.host) + '/api/v1/Request/movie/',
					body: JSON.stringify({ "theMovieDbId": movie.theMovieDbId })
				}).then((resolve) => {
					return msg.reply(`Requested ${movie.title} in Ombi.`);
				}).catch((error) => {
					console.error(error);
					return msg.reply('There was an error in your request.');
				});
			}
		}).catch(collected => {
			return movieMsg;
		});
	}
	return movieMsg;
}

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

	async run (msg, args) {
		if (!args.name) {
			return msg.reply('Please enter a valid movie name!');
		}

		let ombi = this.client.webDatabase.webConfig.ombi
		let tmdbid = null

		if (args.name.startsWith("tmdb:")) {
			let matches = /^tmdb:(\d+)$/.exec(args.name)
			if (matches) {
				tmdbid = matches[1]
			} else {
				return msg.reply('Please enter a valid TMDb ID!');
			}
		} else {
			tmdbid = await getTMDbID(ombi, msg, args.name)
		}

		if (tmdbid) {
			get({
				headers: {'accept' : 'application/json',
				'ApiKey': ombi.apikey,
				'User-Agent': `Mellow/${process.env.npm_package_version}`},
				url: (checkURLPrefix(ombi.host) ? ombi.host : `http://${ombi.host}`) + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/Search/movie/info/' + tmdbid
			})
			.then(({response, body}) => {
				let data = JSON.parse(body)
				outputMovie(msg, data).then((dataMsg) => {
					deleteCommandMessages(msg, this.client);
					requestMovie(ombi, msg, dataMsg, data);
				})
			})
			.catch((error) => {
				console.error(error);
				return msg.reply('There was an error in your request.');
			})
		}
	}
};
