const commando = require('discord.js-commando');
const {deleteCommandMessages, get, getURL} = require('../../util.js');

module.exports = class refreshLibraryCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'refreshlibrary',
			'memberName': 'refreshlibrary',
			'group': 'tautulli',
			'description': 'refresh all libraries in tautulli',
			'examples': ['refreshlibrary'],
			'guildOnly': true
		});
    }
    
    run (msg) {
		const tautulli = this.client.webDatabase.webConfig.tautulli;
		get({
			headers: {'accept' : 'application/json',
			'User-Agent': `Mellow/${process.env.npm_package_version}`},
			url: getURL(tautulli.host, tautulli.port, tautulli.ssl, tautulli.baseurl + '/api/v2?apikey=' + tautulli.apikey + '&cmd=refresh_libraries_list')
		}).then((resolve) => {
			deleteCommandMessages(msg, this.client);
			msg.reply('Refreshed all libraries in Tautulli.');
		}).catch((error) => {
			console.error(error);
			return msg.reply('There was an error in your request.');
		});
    }
};
