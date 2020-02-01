const commando = require('discord.js-commando');
const { executeTV, executeMovie } = require('../../services/ombi.js');

module.exports = class ombiCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'ombi',
			'memberName': 'ombi',
			'aliases': ['o'],
			'group': 'ombi',
			'description': 'Search and Request TV Shows and Movies in Ombi',
			'examples': ['ombi tv The Big Bang Theory', 'ombi tv tvdb:80379', 'ombi movie The Matrix'],
			'guildOnly': true,
			'argsPromptLimit': 0,
			'args': [
				{
					'key': 'type',
					'prompt': 'Movie or TV',
					'type': 'string'
                },
                {
                    'key': 'name',
					'prompt': 'Name of the TV Show or Movie',
					'type': 'string'
                }
			]
		});
	}

	async run (msg, args) {
		if (args.type.toLowerCase() === 'movie') {
			return executeMovie(this.client, msg, args);
		} else if (args.type.toLowerCase() === 'tv') {
			return executeTV(this.client, msg, args);
		} else {
			this.client.deleteCommandMessages(msg);
			return msg.reply('Something went wrong! Please use ``movie`` or ``tv`` as type.');
		}
	}
};
