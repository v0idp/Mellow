const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, get} = require('../../util.js');

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
    
    run (msg, args) {
		this.client.webDB.loadSettings('tautulli').then((tautulli) => {
			get({
				headers: {'accept' : 'application/json',
				'User-Agent': `Mellow/${process.env.npm_package_version}`},
				url:     'http://' + tautulli.host + ((tautulli.port) ? ':' + tautulli.port : '') + '/api/v2?apikey=' + tautulli.apikey + '&cmd=get_libraries'
			}).then((resolve) => {
				let jsonObject = JSON.parse(resolve.body);
				let libraryEmbed = new Discord.MessageEmbed()
				.setTitle('Server Libraries')
				.setTimestamp(new Date())
				.setThumbnail('https://i.imgur.com/pz9PoqR.png');
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
				console.error(error);
				return msg.reply('There was an error in your request.');
			});
		}).catch((err) => console.error(err));
    }
};