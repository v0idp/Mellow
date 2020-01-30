const commando = require('discord.js-commando');
const { executeMovie } = require('./services/ombi.js');

module.exports = class searchMovieCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'movie',
			'memberName': 'movie',
			'group': 'searchrequest',
			'description': 'Search and Request Movies in Ombi or Radarr',
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
		const config = this.client.webDatabase.webConfig;

		// check which service is set to default and available and then use that
		// only use ombi until radarr is implemented completely
		if (config.bot.defaultservice === 'ombi')
			if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return await executeMovie(this.client, msg, args);
			else
				return msg.reply('Please configure ombi first!');
	}
};
