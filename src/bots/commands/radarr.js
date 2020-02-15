const RadarrService = require('../services/radarr.js');

module.exports = class radarrCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'radarr',
			'group': 'radarr',
            'aliases': ['r'],
			'description': 'Search and Add Movies in Radarr',
			'examples': ['radarr The Matrix', 'radarr tmdb:603'],
			'guildOnly': true
		},
		this.services = {
			radarr: new RadarrService(client)
		}
	}

	hasPermission(user) {
		return true;
	}

	async run (msg, args) {
		return this.services.radarr.run(msg, args.join(' '));
	}
};
