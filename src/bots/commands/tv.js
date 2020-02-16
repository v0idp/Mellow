const OmbiService = require('../services/ombi.js');
const SonarrService = require('../services/sonarr.js');

module.exports = class searchTVShowCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'tv',
			'description': 'Search and Request TV Shows in Ombi or Sonarr',
			'examples': ['tv The Big Bang Theory', 'tv tvdb:80379'],
			'guildOnly': true
		},
		this.services = {
			ombi: new OmbiService(client),
			sonarr: new SonarrService(client)
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
				return this.services.ombi.runSeries(msg, searchQuery);
			else if (config.sonarr.host !== '' && config.sonarr.apikey !== '')
				return this.services.sonarr.run(msg, searchQuery);
		}
		else {
			if (config.sonarr.host !== '' && config.sonarr.apikey !== '')
				return this.services.sonarr.run(msg, searchQuery);
			else if (config.ombi.host !== '' && config.ombi.apikey !== '')
				return this.services.ombi.runSeries(msg, searchQuery);
		}

		return msg.reply('Please configure **Ombi** or **Sonarr** before using this command.');
	}
};
