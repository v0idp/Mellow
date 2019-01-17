const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, get, post} = require('../../util.js');
	
function outputMovie(msg, movie) {
	// populate basic selected result into embed
	let movieEmbed = new Discord.MessageEmbed()
	.setTitle(`${movie.title} ${(movie.releaseDate) ? `(${movie.releaseDate.split('T')[0]})` : '(unknown)' }`)
	.setDescription(movie.overview.substr(0, 255) + '(...)')
	.setFooter('Click the thumbnail to get more informations about the movie.')
	.setTimestamp(new Date())
	.setImage('https://image.tmdb.org/t/p/w500' + movie.posterPath)
	.setURL('https://www.themoviedb.org/movie/' + movie.theMovieDbId)
	.setThumbnail('https://i.imgur.com/K55EOJH.png');

	// populate only the data which is true, otherwise not
	if (movie.available) movieEmbed.addField('__Available__', '✅', true);
	if (movie.quality) movieEmbed.addField('__Quality__', movie.quality, true);
	if (movie.requested) movieEmbed.addField('__Requested__', '✅', true);
	if (movie.approved) movieEmbed.addField('__Approved__', '✅', true);
	if (movie.plexUrl) movieEmbed.addField('__Plex__', `[Watch now](${movie.plexUrl})`, true);
	if (movie.embyUrl) movieEmbed.addField('__Emby__', `[Watch now](${movie.embyUrl})`, true);

	// send embed into chat
	return msg.embed(movieEmbed);
}

// only works when the user has permission to request
function requestMovie(ombi, msg, movieMsg, movie) {
	// check if user has request role and if it's not available, requested and approved
	if ((!ombi.requestmovie || msg.member.roles.some(role => role.name === ombi.requestmovie)) && (!movie.available && !movie.requested && !movie.approved)) {
		msg.reply('If you want to request this movie please click on the ⬇ reaction.');
		movieMsg.react('⬇');
		
		// wait for user reaction
		movieMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 })
		.then(collected => {
			// request movie in ombi
			if (collected.first()) {
				post({
					headers: {'accept' : 'application/json',
					'Content-Type' : 'application/json',
					'ApiKey' : ombi.apikey,
					'ApiAlias' : `${msg.author.username} (${msg.author.id})`,
					'User-Agent': `Mellow/${process.env.npm_package_version}`},
					url: 'http://' + ombi.host + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/Request/movie/',
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
			'description': 'search and request movies in ombi',
			'examples': ['movie the matrix'],
			'guildOnly': true,

			'args': [
				{
					'key': 'name',
					'prompt': 'name of the movie',
					'type': 'string'
				}
			]
		});
	}

	run (msg, args) {
		// check if there is any valid search term before requesting anything
		if (!args.name) {
			return msg.reply('Please enter a valid movie name!');
		}

		// search for movies through ombi API
		this.client.webDB.loadSettings('ombi').then((ombi) => {
			get({
				headers: {'accept' : 'application/json',
				'ApiKey' : ombi.apikey,
				'User-Agent': `Mellow/${process.env.npm_package_version}`},
				url:     'http://' + ombi.host + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/Search/movie/' + args.name
			}).then((resolve) => {
				// parse body into json objects
				let data = JSON.parse(resolve.body);
				let movieEmbed = new Discord.MessageEmbed();

				// check if data contains any results
				if (data.length == 0) {
					return msg.reply('Couldn\'t find the movie you were looking for. Is the name correct?');
				}

				// if only one search result exists output that
				let selection = 0;
				if (data.length <= 1) {
					// output data into chat and request the movie
					outputMovie(msg, data[selection]).then(dataMsg => {
						deleteCommandMessages(msg, this.client);
						requestMovie(ombi, msg, dataMsg, data[selection]);
					}).catch((error) => {
						msg.reply('Cancelled command.');
					});
					return;
				}

				// populate results into string for embed
				let fieldContent = '';
				for (let i = 0; i < data.length; i++) {
					fieldContent += `${i+1}) ${data[i].title}`;
					if (data[i].releaseDate) fieldContent += ` (${data[i].releaseDate.split('T')[0]})`;
					fieldContent += '\n';
				}

				// output search results in embed
				movieEmbed.setTitle('Ombi Movie Search')
				.setDescription('Please select one of the search results. To abort answer **cancel**')
				.addField('__Search Results__', fieldContent);
				msg.embed(movieEmbed);

				// wait for user selection
				msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
				.then(collected => {
					if (collected.first().content.startsWith('cancel')) return msg.reply('Cancelled command.');
					else if (parseInt(collected.first().content) >= 1 && parseInt(collected.first().content) <= data.length) {
						selection = parseInt(collected.first().content.match(/[1-9]+/)[0])-1; 

						// output data into chat and request the movie
						outputMovie(msg, data[selection]).then(dataMsg => {
							deleteCommandMessages(msg, this.client);
							return requestMovie(ombi, msg, dataMsg, data[selection]);
						}).catch((error) => {
							return msg.reply('Cancelled command.');
						});
					}
				}).catch(collected => {
					return msg.reply('Cancelled command.');
				});
			}).catch((error) => {
				console.error(error);
				return msg.reply('There was an error in your request.');
			});
		}).catch((err) => console.error(err));
	}
};