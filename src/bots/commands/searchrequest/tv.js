const commando = require('discord.js-commando');
const { executeTV } = require('./services/ombi.js');

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

		// check which service is set to default and available and then use that
		// only use ombi until sonarr is implemented completely
		if (config.bot.defaultservice === 'ombi')
			if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return await executeTV(this.client, msg, args);
			else
				return msg.reply('Please configure ombi first!');
	}
};
