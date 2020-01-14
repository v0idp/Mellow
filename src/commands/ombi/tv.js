const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, get, post, getURL} = require('../../util.js');

function outputTVShow(msg, show) {
	let tvEmbed = new Discord.MessageEmbed()
	.setTitle(`${show.title} ${(show.firstAired) ? `(${show.firstAired.substring(0,4)})` : ''}`)
	.setDescription(show.overview.substr(0, 255) + '(...)')
	.setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
	.setTimestamp(new Date())
	.setImage(show.banner)
	.setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
	.setThumbnail('https://i.imgur.com/9dcDIYe.png')
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

function getTVDBID(ombi, msg, name) {
	return new Promise((resolve, reject) => {
		get({
			headers: {'accept' : 'application/json',
			'ApiKey': ombi.apikey,
			'User-Agent': `Mellow/${process.env.npm_package_version}`},
			url: getURL(ombi.host, ombi.port, ombi.ssl, '/api/v1/Search/tv/' + name)
		}).then(({response, body}) => {
			let data = JSON.parse(body)

			if (data.length > 1) {
				let fieldContent = '';
				data.forEach((show, i) => {
					fieldContent += `${i+1}) ${show.title} `
					if (show.firstAired) fieldContent += `(${show.firstAired.substring(0,4)}) `
					fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${show.id}&tab=series)]\n`
				})
			
				let showEmbed = new Discord.MessageEmbed()
				showEmbed.setTitle('Ombi TV Show Search')
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
				msg.reply('Couldn\'t find the TV show you were looking for. Is the name correct?');
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

function requestTVShow(ombi, msg, showMsg, show) {
	if ((!ombi.requesttv || msg.member.roles.some(role => role.name === ombi.requesttv)) && (!show.available && !show.requested && !show.approved)) {
		msg.reply('If you want to request this TV show please click on the ⬇ reaction.');
		showMsg.react('⬇');
		
		showMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 })
		.then(collected => {
			if (collected.first()) {
				post({
					headers: {'accept' : 'application/json',
					'Content-Type' : 'application/json',
					'ApiKey': ombi.apikey,
					'ApiAlias' : `${msg.author.username}#${msg.author.discriminator}`,
					'UserName' : ombi.username ? ombi.username : undefined,
					'User-Agent': `Mellow/${process.env.npm_package_version}`},
					url: getURL(ombi.host, ombi.port, ombi.ssl, '/api/v1/Request/tv/'),
					body: JSON.stringify({ "tvDbId": show.id, "requestAll" : true })
				}).then((resolve) => {
					return msg.reply(`Requested ${show.title} in Ombi.`);
				}).catch((error) => {
					console.error(error);
					return msg.reply('There was an error in your request.');
				});
			}
		}).catch(collected => {
			return showMsg;
		});
	}
	return showMsg;
}

module.exports = class searchTVCommand extends commando.Command {
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

	async run (msg, args) {
		if (!args.name) {
			return msg.reply('Please enter a valid TV show name!');
		}

		let ombi = this.client.webDatabase.webConfig.ombi
		let tvdbid = null

		if (args.name.startsWith("tvdb:")) {
			let matches = /^tvdb:(\d+)$/.exec(args.name)
			if (matches) {
				tvdbid = matches[1]
			} else {
				return msg.reply('Please enter a valid TheTVDB ID!');
			}
		} else {
			tvdbid = await getTVDBID(ombi, msg, args.name)
		}

		if (tvdbid) {
			get({
				headers: {'accept' : 'application/json',
				'ApiKey': ombi.apikey,
				'User-Agent': `Mellow/${process.env.npm_package_version}`},
				url: getURL(ombi.host, ombi.port, ombi.ssl, '/api/v1/Search/tv/info/' + tvdbid)
			})
			.then(({response, body}) => {
				let data = JSON.parse(body)
				outputTVShow(msg, data).then((dataMsg) => {
					deleteCommandMessages(msg, this.client);
					requestTVShow(ombi, msg, dataMsg, data);
				})
			})
			.catch((error) => {
				console.error(error);
				return msg.reply('There was an error in your request.');
			})
		}
	}
};
