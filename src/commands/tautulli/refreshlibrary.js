const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, get, post} = require('../../util.js');
const config = require('../../config.json');

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
    
    run (msg, args) {
        get({
			headers: {'accept' : 'application/json',
			'User-Agent': `Mellow/${process.env.npm_package_version}`},
            url:     `http://${config.tautulli.ip}:${config.tautulli.port}/api/v2?apikey=${config.tautulli.apiKey}&cmd=refresh_libraries_list`
        }).then((resolve) => {
			deleteCommandMessages(msg, this.client);
			msg.reply('Refreshed all libraries in Tautulli.');
        }).catch((error) => {
			return msg.reply('There was an error in your request.');
		});
    }
};