const Discord = require('discord.js');
const commando = require('discord.js-commando');
const path = require('path');

module.exports = class searchMovieCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'ombi',
			'memberName': 'ombi',
			'group': 'ombi',
			'description': 'Search and Request Movies in Ombi',
			'examples': ['ombi movie The Matrix', 'ombi movie tmdb:603', 'otv The Big Bang Theory', 'otv tvdb:80379'],
			'guildOnly': true,
			'argsPromptLimit': 0,
			'args': [
				{
					'key': 'type',
					'prompt': 'type of the Content (movie or tv)',
					'type': 'string'
				},
				{
					'key': 'name',
					'prompt': 'Name of the Content',
					'type': 'string'
				}
			]
		});
	}

	outputContent(msg, type, content) {
		let contentEmbed = new Discord.MessageEmbed()
		.setDescription(content.overview.substr(0, 255) + '(...)')
		.setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
		.setTimestamp(new Date())

		if (type === 'movie') {
			contentEmbed
			.setTitle(`${content.title} ${(content.releaseDate) ? `(${content.releaseDate.split('T')[0].substring(0,4)})` : ''}`)
			.setImage('https://image.tmdb.org/t/p/w500' + content.posterPath)
			.setURL('https://www.themoviedb.org/movie/' + content.theMovieDbId)
			.attachFiles(path.join(__dirname, '..', '..', '..', 'resources', 'tmdb.png'))
			.setThumbnail('attachment://tmdb.png');
		} else {
			contentEmbed
			.setTitle(`${content.title} ${(content.firstAired) ? `(${content.firstAired.substring(0,4)})` : ''}`)
			.setImage(content.banner)
			.setURL(`https://www.thetvdb.com/?id=${content.id}&tab=series`)
			.attachFiles(path.join(__dirname, '..', '..', '..', 'resources', 'tvdb.png'))
			.setThumbnail('attachment://tvdb.png')
			.addField('__Network__', content.network, true)
			.addField('__Status__', content.status, true);
		}
	
		if (content.available) contentEmbed.addField('__Available__', '✅', true);
		if (content.quality) contentEmbed.addField('__Quality__', `${content.quality}p` , true);
		if (content.requested) contentEmbed.addField('__Requested__', '✅', true);
		if (content.approved) contentEmbed.addField('__Approved__', '✅', true);
		if (content.plexUrl) contentEmbed.addField('__Plex__', `[Watch now](${content.plexUrl})`, true);
		if (content.embyUrl) contentEmbed.addField('__Emby__', `[Watch now](${content.embyUrl})`, true);
	
		return msg.embed(contentEmbed);
	}
	
	getDbID(msg, type, name) {
		return new Promise((resolve) => {
			this.client.API.ombi.searchContent(type, name).then((data) => {
				if (data.length > 1) {
					let fieldContent = '';
					data.forEach((content, i) => {
						fieldContent += `${i+1}) ${content.title} `
						if (type === 'movie') {
							if (content.releaseDate) fieldContent += `(${content.releaseDate.substring(0,4)}) `
							fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${content.theMovieDbId})]\n`
						} else {
							if (content.firstAired) fieldContent += `(${content.firstAired.substring(0,4)}) `
							fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${content.id}&tab=series)]\n`
						}
					});
				
					let contentEmbed = new Discord.MessageEmbed();
					contentEmbed.setTitle(`Ombi ${(type === 'movie') ? 'Movie' : 'TV Show'} Search`)
					.setDescription('Please select one of the search results. To abort answer **cancel**')
					.addField('__Search Results__', fieldContent);
					
					const aMsg = msg.embed(contentEmbed);
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
					msg.reply(`Couldn't find the ${(type === 'movie') ? 'movie' : 'tv show'} you were looking for. Is the name correct?`);
				} else {
					resolve(data[0].id);
				}
			}).catch(() => {
				msg.reply(`Something went wrong! Couldn't find any ${(type === 'movie') ? 'movie' : 'tv show'}.`);
			});
		});
	}
	
	requestContent(msg, contentMsg, type, content) {
		const ombi = this.client.webDatabase.getConfig()['ombi'];

		if (type === 'movie') {
			if ((ombi.requestmovie || !msg.member.roles.some(role => role.name.toLowerCase() === ombi.requestmovie.toLowerCase()))
			&& (content.available || content.requested || content.approved))
				return;
		} else {
			if ((ombi.requesttv || !msg.member.roles.some(role => role.name.toLowerCase() === ombi.requesttv.toLowerCase()))
			&& (content.available || content.requested || content.approved))
				return;
		}

		msg.reply(`If you want to request this ${(type === 'movie') ? 'movie' : 'tv show'} please click on the ⬇ reaction.`);
		contentMsg.react('⬇');
		
		contentMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 }).then(collected => {
			if (collected.first()) {
				this.client.API.ombi.requestContent((type === 'movie' ? 'movie' : 'tv'),
				(type === 'movie' ? { 'theMovieDbId': content.theMovieDbId } : { 'tvDbId': content.id, "requestAll": true}),
				`${encodeURI(msg.author.username.toLowerCase())}#${msg.author.discriminator}`).then(() => {
					return msg.reply(`Requested ${content.title} in Ombi.`);
				}).catch(() => {
					return msg.reply(`Something went wrong! Couldn't request ${(type === 'movie') ? 'movie' : 'tv show'}.`);
				});
			}
		}).catch(() => {
			return msg.reply('Something went wrong! Couldn\'t register your emoji.');
		});
		return contentMsg;
	}

	async run (msg, args) {
		this.client.deleteCommandMessages(msg);
		args.type = args.type.toLowerCase();
		if (!args.name) {
			return msg.reply(`Please enter a valid ${(args.type === 'movie') ? 'movie' : 'tv show'} name.`);
		}

		let dbid = undefined;
		if (args.name.startsWith("tmdb:") || args.name.startsWith("tvdb:")) {
			const matches = /^(tmdb|tvdb):(\d+)$/.exec(args.name);
			if (matches) {
				dbid = matches[1];
			} else {
				return msg.reply(`Please enter a valid ${(args.type === 'movie') ? 'TMdb' : 'TVdb'} ID!`);
			}
		} else {
			dbid = await this.getDbID(msg, args.type, args.name);
		}

		if (dbid) {
			this.client.API.ombi.getContentInformation(args.type, dbid).then((data) => {
				this.outputContent(msg, args.type, data).then((dataMsg) => {
					this.requestContent(msg, dataMsg, args.type, data);
				});
			}).catch(() => {
				return msg.reply(`Something went wrong! Couldn\'t get ${(args.type === 'movie') ? 'movie' : 'tv show'} information.`);
			});
		}
	}
};
