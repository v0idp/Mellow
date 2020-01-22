const commando = require('discord.js-commando');
const { deleteCommandMessages } = require('../../util.js');

module.exports = class refreshLibrariesCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'refreshlibraries',
			'memberName': 'refreshlibraries',
			'group': 'tautulli',
			'description': 'refresh all libraries in tautulli',
			'examples': ['refreshlibraries'],
			'guildOnly': true
		});
    }
    
    run (msg) {
		this.client.API.tautulli.refreshLibraries().then(() => {
			deleteCommandMessages(msg);
			return msg.reply('Refreshed all libraries in Tautulli.');
		}).catch(() => {
			return msg.reply('Something went wrong! Couldn\'t refresh libraries.');
		});
    }
};
