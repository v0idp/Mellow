const commando = require('discord.js-commando');
const executeAdd = require('../../services/radarr.js');

module.exports = class radarrCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'radarr',
            'memberName': 'radarr',
            'aliases': ['r'],
			'group': 'radarr',
			'description': 'Search and Add Movies in Radarr',
			'examples': ['radarr The Matrix', 'radarr tmdb:603'],
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
		return executeAdd(this.client, msg, args);
	}
};
