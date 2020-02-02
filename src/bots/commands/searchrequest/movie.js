const commando = require('discord.js-commando');
const { executeMovie } = require('../../services/ombi.js');
const executeAdd = require('../../services/radarr.js');

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

		if (config.bot.defaultservice === 'ombi') {
			if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return executeMovie(this.client, msg, args);
			else if (config.sonarr.host !== '' && config.radarr.apikey !== '')
				return executeAdd(this.client, msg, args);
		}
		else {
			if (config.radarr.host !== '' && config.radarr.apikey !== '')
				return executeAdd(this.client, msg, args);
			else if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return executeMovie(this.client, msg, args);
		}

		return msg.reply('Please configure **Ombi** or **Radarr** before using this command.');
	}
};
