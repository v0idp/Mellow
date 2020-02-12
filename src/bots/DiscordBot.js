const Commando = require('discord.js-commando');
const path = require('path');
const fs = require('fs');
const APIHandler = require('../api/api.js');

module.exports = class BotClient extends Commando.Client {
	constructor (webDatabase, token, ownerid, commandprefix) {
		super({
			"owner": (ownerid !== '') ? ownerid : undefined,
			"commandPrefix": (commandprefix !== '') ? commandprefix : '$',
			"invite": 'https://discord.gg/zx2BWp2'
		});
		this.token = token;
		this.webDatabase = webDatabase;
		this.API = new APIHandler(webDatabase.getConfig());
		this.isReady = false;
	}

	deleteCommandMessages = (msg) => {
		if (msg.deletable && this.webDatabase.getConfig()['bot'].deletecommandmessages === 'true') {
			return msg.delete();
		}
	}

	init () {
		return new Promise((resolve, reject) => {
			try {
				// dynamically register our events based on the content of the events folder
				fs.readdir(path.join(__dirname, 'events'), (err, files) => {
					if (err) return console.error(err);
					files.forEach(file => {
						let eventFunction = require(`./events/${file}`);
						let eventName = file.split(".")[0];
						this.on(eventName, (...args) => eventFunction.run(this, ...args));
					});
				});

				// first we register groups and commands
				this.registry
				.registerDefaultGroups()
				.registerGroups([
					['searchrequest', 'Search & Request'],
					['ombi', 'Ombi'],
					['sonarr', 'Sonarr'],
					['radarr', 'Radarr'],
					['tautulli', 'Tautulli']
				])
				.registerDefaultTypes()
				.registerDefaultCommands({
					'help': true,
					'ping': true,
					'eval': false,
					'unknownCommand': (this.webDatabase.webConfig.bot.unknowncommandresponse === 'true') ? true : false
				}).registerCommandsIn(path.join(__dirname, 'commands'));

				// unregister groups if apikey and host is not provided in web database
				// thanks to the commando framework we have to go the dirty way
				this.registry.groups.forEach((group) => {
					const checkGroups = ['ombi', 'sonarr', 'radarr', 'tautulli'];
					if(checkGroups.indexOf(group.name.toLowerCase()) > -1) {
						const groupConfig = this.webDatabase.webConfig[group.name.toLowerCase()];
						if (groupConfig.host === "" || groupConfig.apikey === "")
							group.commands.forEach((command) => this.registry.unregisterCommand(command));
					}
				});

				const channelname = this.webDatabase.webConfig['bot'].channelname.toLowerCase();
				if (channelname !== "") {
					this.dispatcher.addInhibitor((msg) => {
						return (channelname !== msg.channel.name.toLowerCase() && msg.guild.channels.has(channelname)) ? 'Not allowed in this channel' : false;
					});
				}
				
				// login client with bot token
				this.login(this.token)
					.then((token) => resolve(token))
					.catch((err) => reject(err));
			}
			catch (err) {
				reject(err);
			}
		});
	}

	deinit () {
		this.isReady = false;
		this.destroy();
	}
}
