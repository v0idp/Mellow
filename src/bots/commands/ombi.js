const OmbiService = require('../services/ombi.js');

module.exports = class ombiCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'ombi',
			'group': 'ombi',
			'aliases': ['o'],
			'description': 'Search and Request TV Shows and Movies in Ombi',
			'examples': ['ombi tv The Big Bang Theory', 'ombi tv tvdb:80379', 'ombi movie The Matrix'],
			'guildOnly': true
		},
		this.services = {
			ombi: new OmbiService(client)
		}
	}

	hasPermission(user) {
		return true;
	}

	async run (msg, args) {
		if(args.length < 2) {
			return this.client.reply(msg, 'Please provide the type and search query.');
		}

		const type = args.shift();
		if (type.toLowerCase() === 'movie') {
			return this.services.ombi.runMovie(msg, args[0]);
		} else if (type.toLowerCase() === 'tv') {
			return this.services.ombi.runSeries(msg, args[0]);
		} else {
			this.client.deleteCommandMessages(msg);
			return this.client.reply(msg, 'Something went wrong! Please use ``movie`` or ``tv`` as type.');
		}
	}
};
