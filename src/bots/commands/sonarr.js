const SonarrService = require('../services/sonarr.js');

module.exports = class sonarrCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'sonarr',
			'group': 'sonarr',
            'aliases': ['s'],
			'description': 'Search and Add Series in Sonarr',
			'examples': ['sonarr The Big Bang Theory', 'sonarr tvdb:80379'],
			'guildOnly': true
		},
		this.services = {
			sonarr: new SonarrService(client)
		}
	}

	hasPermission(user) {
		return true;
	}

	async run (msg, args) {
		return this.services.sonarr.run(msg, args.join(' '));
	}
};
