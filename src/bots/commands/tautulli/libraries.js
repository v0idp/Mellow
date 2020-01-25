const Discord = require('discord.js');
const commando = require('discord.js-commando');
const path = require('path');

module.exports = class librariesCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'libraries',
			'memberName': 'libraries',
			'group': 'tautulli',
			'description': 'get a list of all libraries on your server',
			'examples': ['libraries'],
			'guildOnly': true
		});
    }
    
    run (msg) {
		this.client.API.tautulli.getLibraries().then((jsonResponse) => {
			let libraryEmbed = new Discord.MessageEmbed()
			.setTitle('Server Libraries')
			.setTimestamp(new Date())
			.attachFiles(path.join(__dirname, '..', '..', '..', 'resources', 'libraries.png'))
			.setThumbnail('attachment://libraries.png');
			for (let i = 0; i < Object.keys(jsonResponse.response.data).length; i++) {
				let obj = jsonResponse.response.data[i];
				if (obj.section_type == 'movie') {
					libraryEmbed.addField(obj.section_name, obj.count, true);
				} else if (obj.section_type == 'show') {
					libraryEmbed.addField(obj.section_name, `${obj.count} Shows\n${obj.parent_count} Seasons\n${obj.child_count} Episodes`, true);
				}
			}
			this.client.deleteCommandMessages(msg);
			return msg.embed(libraryEmbed);
		}).catch(() => {
			this.client.deleteCommandMessages(msg);
			return msg.reply('Something went wrong! Couldn\'t get libraries.');
		});
    }
};
