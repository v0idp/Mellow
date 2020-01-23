const Discord = require('discord.js');
const commando = require('discord.js-commando');
const path = require('path');

module.exports = class searchTVShowCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'tv',
			'memberName': 'tv',
			'group': 'ombi',
			'description': 'Search and Request TV Shows in Ombi',
			'examples': ['tv The Big Bang Theory', 'tv tvdb:80379'],
			'guildOnly': true,
			'argsPromptLimit': 0,
			'args': [
				{
					'key': 'name',
					'prompt': 'Name of the TV Show',
					'type': 'string'
				}
			]
		});
	}

	outputTVShow(msg, show) {
		let tvEmbed = new Discord.MessageEmbed()
		.setTitle(`${show.title} ${(show.firstAired) ? `(${show.firstAired.substring(0,4)})` : ''}`)
		.setDescription(show.overview.substr(0, 255) + '(...)')
		.setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
		.setTimestamp(new Date())
		.setImage(show.banner)
		.setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
		.attachFiles(path.join(__dirname, '..', '..', 'resources', 'tvdb.png'))
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
	
	getTVDbID(msg, name) {
		return new Promise((resolve) => {
			this.client.API.ombi.searchTVShow(name).then((data) => {
				if (data.length > 1) {
					let fieldContent = '';
					data.forEach((show, i) => {
						fieldContent += `${i+1}) ${show.title} `
						if (show.firstAired) fieldContent += `(${show.firstAired.substring(0,4)}) `
						fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${show.id}&tab=series)]\n`
					})
				
					let showEmbed = new Discord.MessageEmbed();
					showEmbed.setTitle('Ombi TV Show Search')
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
					msg.reply('Couldn\'t find the tv show you were looking for. Is the name correct?');
				} else {
					resolve(data[0].id);
				}
			}).catch(() => {
				msg.reply('Something went wrong! Couldn\'t find any tv show.');
			});
		});
	}
	
	requestTVShow(msg, showMsg, show) {
		const ombi = this.client.webDatabase.loadConfigTable('ombi');
		if ((!ombi.requesttv || msg.member.roles.some(role => role.name === ombi.requesttv)) && (!show.available && !show.requested && !show.approved)) {
			msg.reply('If you want to request this tv show please click on the ⬇ reaction.');
			showMsg.react('⬇');
			
			showMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 }).then(collected => {
				if (collected.first()) {
					this.client.API.ombi.requestTVShow(show.id, `${encodeURI(msg.author.username)}#${msg.author.discriminator}`).then(() => {
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

	async run (msg, args) {
		deleteCommandMessages(msg);
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
			tvdbid = await this.getTVDbID(msg, args.name);
		}

		if (tvdbid) {
			this.client.API.ombi.getTVShowInformation(tvdbid).then((data) => {
				this.outputTVShow(msg, data).then((dataMsg) => {
					this.requestTVShow(msg, dataMsg, data);
				});
			}).catch(() => {
				return msg.reply('Something went wrong! Couldn\'t get tv show information.');
			});
		}
	}
};
