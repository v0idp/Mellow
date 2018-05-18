const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, get, post} = require('../../util.js');
const config = require('../../config.json');

module.exports = class libraryCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'library',
			'memberName': 'library',
			'group': 'tautulli',
			'description': 'get a list of all libraries on your server',
			'examples': ['library'],
			'guildOnly': true
		});
    }
    
    run (msg, args) {
        get({
            headers: {'accept' : 'application/json'},
            url:     `http://${config.tautulli.ip}:${config.tautulli.port}/api/v2?apikey=${config.tautulli.apiKey}&cmd=get_libraries`
        }).then((resolve) => {
			let jsonObject = JSON.parse(resolve.body);
			let libraryEmbed = new Discord.MessageEmbed()
			.setTitle('Server Libraries')
			.setTimestamp(new Date())
			.setThumbnail('https://i.imgur.com/pz9PoqR.png')
            for (let i = 0; i < Object.keys(jsonObject.response.data).length; i++) {
				let obj = jsonObject.response.data[i];
				if (obj.section_type == 'movie') {
					libraryEmbed.addField(obj.section_name, obj.count, true);
				} else if (obj.section_type == 'show') {
					libraryEmbed.addField(obj.section_name, `${obj.count} Shows\n${obj.parent_count} Seasons\n${obj.child_count} Episodes`, true);
				}
			}
			deleteCommandMessages(msg, this.client);
			msg.embed(libraryEmbed);
        }).catch((error) => {
			return msg.reply('There was an error in your request.');
		});;
    }
};