const OmbiService = require('../services/ombi.js');
const RadarrService = require('../services/radarr.js');

module.exports = class searchMovieCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'movie',
			'description': 'Search and Request Movies in Ombi or Radarr',
			'examples': ['movie The Matrix', 'movie tmdb:603'],
			'guildOnly': true
		},
		this.services = {
			ombi: new OmbiService(client),
			radarr: new RadarrService(client)
		}
	}

	hasPermission(user) {
		return true;
	}

	async run (msg, args) {
		const config = this.client.db.config;
		const searchQuery = args.join(' ');

		if (config.bot.defaultservice === 'ombi') {
			if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return this.services.ombi.runMovie(msg, searchQuery);
			else if (config.sonarr.host !== '' && config.radarr.apikey !== '')
				return this.services.radarr.run(msg, searchQuery);
		}
		else {
			if (config.radarr.host !== '' && config.radarr.apikey !== '')
				return this.services.radarr.run(msg, searchQuery);
			else if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return this.services.ombi.runMovie(msg, searchQuery);
		}

		return msg.reply('Please configure **Ombi** or **Radarr** before using this command.');
	}
};
