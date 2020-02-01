const commando = require('discord.js-commando');
const executeAdd = require('../../services/sonarr.js');

module.exports = class sonarrCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'sonarr',
            'memberName': 'sonarr',
            'aliases': ['s'],
			'group': 'sonarr',
			'description': 'Search and Add Series in Sonarr',
			'examples': ['sonarr The Big Bang Theory', 'sonarr tvdb:80379'],
			'guildOnly': true,
			'argsPromptLimit': 0,
			'args': [
				{
					'key': 'name',
					'prompt': 'Name of the Series',
					'type': 'string'
                }
			]
		});
	}

	async run (msg, args) {
		return executeAdd(this.client, msg, args);
	}
};
