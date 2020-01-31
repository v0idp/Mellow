const commando = require('discord.js-commando');
const { executeTV } = require('../../services/ombi.js');
const executeAdd = require('../../services/sonarr.js');

module.exports = class searchTVShowCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'tv',
			'memberName': 'tv',
			'group': 'searchrequest',
			'description': 'Search and Request TV Shows in Ombi or Sonarr',
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
		const config = this.client.webDatabase.webConfig;

		if (config.bot.defaultservice === 'ombi') {
			if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return executeTV(this.client, msg, args);
			else if (config.sonarr.host !== '' && config.sonarr.apikey !== '')
				return executeAdd(this.client, msg, args);
		}
		else {
			if (config.sonarr.host !== '' && config.sonarr.apikey !== '')
				return executeAdd(this.client, msg, args);
			else if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return executeTV(this.client, msg, args);
		}

		return msg.reply('Please configure atleast **Ombi** or **Sonarr** before using this command.');
	}
};
