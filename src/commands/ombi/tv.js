const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, get, post} = require('../../util.js');
	
function outputTVShow(msg, show) {
	// populate basic selected result into embed and output it
	let tvEmbed = new Discord.MessageEmbed()
	.setTitle(`${show.title} ${(show.firstAired) ? `(${show.firstAired})` : '(unknown)' }`)
	.setDescription(show.overview.substr(0, 255) + '(...)')
	.setFooter('Click the thumbnail to get more informations about the tv show.')
	.setTimestamp(new Date())
	.setImage(show.banner)
	.setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
	.setThumbnail('https://i.imgur.com/WBX4rf0.png')
	.addField('__Network__', show.network, true)
	.addField('__Status__', show.status, true);

	// populate only the data which is true, otherwise not
	if (show.available) tvEmbed.addField('__Available__', '✅', true);
	if (show.quality) tvEmbed.addField('__Quality__', show.quality, true);
	if (show.requested) tvEmbed.addField('__Requested__', '✅', true);
	if (show.approved) tvEmbed.addField('__Approved__', '✅', true);
	if (show.plexUrl) tvEmbed.addField('__Plex__', `[Watch now](${show.plexUrl})`, true);
	if (show.embyUrl) tvEmbed.addField('__Emby__', `[Watch now](${show.embyUrl})`, true);

	// send embed into chat
	return msg.embed(tvEmbed);
}

// only works when the user has permission to request
function requestTVShow(ombi, msg, showMsg, show) {
	// check if user has request role and if it's not available, requested and approved
	if ((!ombi.requesttv || msg.member.roles.some(role => role.name === ombi.requesttv)) && (!show.available && !show.requested && !show.approved)) {
		msg.reply('If you want to request this tv show please click on the ⬇ reaction.');
		showMsg.react('⬇');
		
		// wait for user reaction
		showMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 })
		.then(collected => {
			// request show in ombi
			if (collected.first()) {
				post({
					headers: {'accept' : 'application/json',
					'Content-Type' : 'application/json',
					'ApiKey' : ombi.apikey,
					'ApiAlias' : `${msg.author.username} (${msg.author.id})`,
					'User-Agent': `Mellow/${process.env.npm_package_version}`},
					url: 'http://' + ombi.host + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/Request/tv/',
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
			'description': 'search and request tv shows in ombi',
			'examples': ['tv big bang theory'],
			'guildOnly': true,

			'args': [
				{
					'key': 'name',
					'prompt': 'name of the tv show',
					'type': 'string'
				}
			]
		});
	}

	run (msg, args) {
		// check if there is any valid search term before requesting anything
		if (!args.name) {
			return msg.reply('Please enter a valid tv show name!');
		}

		// search for tv shows through ombi API
		this.client.webDB.loadSettings('ombi').then((ombi) => {
			get({
				headers: {'accept' : 'application/json',
				'ApiKey' : ombi.apikey,
				'User-Agent': `Mellow/${process.env.npm_package_version}`},
				url:     'http://' + ombi.host + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/Search/tv/' + args.name
			}).then((resolve) => {
				// parse body into json objects
				let data = JSON.parse(resolve.body);
				let showEmbed = new Discord.MessageEmbed();

				// check if data contains any results
				if (data.length == 0) {
					return msg.reply('Couldn\'t find the tv show you were looking for. Is the name correct?');
				}

				// if only one search result exists output that
				let selection = 0;
				if (data.length <= 1) {
					// output data into chat and request the tv show
					outputTVShow(msg, data[selection]).then(dataMsg => {
						deleteCommandMessages(msg, this.client);
						requestTVShow(ombi, msg, dataMsg, data[selection]);
					}).catch((error) => {
						msg.reply('Cancelled command.');
					});
					return;
				}

				// populate results into string for embed
				let fieldContent = '';
				for (let i = 0; i < data.length; i++) {
					fieldContent += `${i+1}) ${data[i].title}`;
					if (data[i].firstAired) fieldContent += ` (${data[i].firstAired})`;
					fieldContent += '\n';
				}

				// output search results in embed
				showEmbed.setTitle('Ombi TV Show Search')
				.setDescription('Please select one of the search results. To abort answer **cancel**')
				.addField('__Search Results__', fieldContent);
				msg.embed(showEmbed);

				// wait for user selection
				msg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
				.then(collected => {
					if (collected.first().content.startsWith('cancel')) return msg.reply('Cancelled command.');
					else if (parseInt(collected.first().content) >= 1 && parseInt(collected.first().content) <= data.length) {
						selection = parseInt(collected.first().content.match(/[1-9]+/)[0])-1; 

						// output data into chat and request the tv show
						outputTVShow(msg, data[selection]).then(dataMsg => {
							deleteCommandMessages(msg, this.client);
							return requestTVShow(ombi, msg, dataMsg, data[selection]);
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
