const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');
const config = require('./config.json');

class Bot {
	constructor (token, selfbot) {
		this.token = token;
		this.client = new Commando.Client({
			"owner": config.general.ownerID,
			"commandPrefix": config.general.globalCommandPrefix,
			"selfbot": selfbot
		});
		this.isReady = false;
	}

	onReady () {
		return () => {
			console.log(`Client ready logged in as ${this.client.user.tag} (${this.client.user.id}). Prefix set to ${this.client.commandPrefix}. Use ${this.client.commandPrefix}help to view the commands list!`);
			this.client.user.setAFK(true);
			this.client.user.setActivity('$help', { type: 'PLAYING' });
			this.isReady = true;
		};
	}

	onCommandPrefixChange () {
		return (guild, prefix) => {
			console.log(`Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`);
		};
	}

	onDisconnect () {
		return () => {
			console.warn('Disconnected!');
		};
	}

	onReconnect () {
		return () => {
			console.warn('Reconnecting...');
		};
	}

	onCmdErr () {
		return (cmd, err) => {
			if (err instanceof Commando.FriendlyError)
				return;
			console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
		};
	}

	onCmdBlock () {
		return (msg, reason) => {
			console.log(`Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''} blocked; ${reason}`);
		};
	}

	onCmdStatusChange () {
		return (guild, command, enabled) => {
			console.log(`Command ${command.groupID}:${command.memberName} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`);
		};
	}

	onGroupStatusChange () {
		return (guild, group, enabled) => {
			console.log(`Group ${group.id} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`);
		};
	}

	onMessage () {
		return (msg) => {
			// nothing here yet
		};
	}

	init () {
		// register our events for logging purposes
		this.client
			.on('ready', this.onReady())
			.on('commandPrefixChange', this.onCommandPrefixChange())
			.on('error', console.error)
			.on('warn', console.warn)
			.on('debug', console.log)
			.on('disconnect', this.onDisconnect())
			.on('reconnecting', this.onReconnect())
			.on('commandError', this.onCmdErr())
			.on('commandBlocked', this.onCmdBlock())
			.on('commandStatusChange', this.onCmdStatusChange())
			.on('groupStatusChange', this.onGroupStatusChange())
			.on('message', this.onMessage());

		// set provider sqlite3 so we can actually save our settings permanently
		this.client.setProvider(
			sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
		).catch(console.error);

		// first we register default groups and commands
		this.client.registry
			.registerDefaultGroups()
			.registerDefaultTypes()
			.registerDefaultCommands({
				'help': true,
				'prefix': true,
				'ping': true,
				'eval_': false,
				'commandState': true
			});

		// then we check for API keys and register command groups according to them
		// double check needed to make sure that commands get registered if any of the api keys is given
		if (config.ombi != "" || config.sonarr != "" || config.radarr != "") {
			if (config.ombi != "") this.client.registry.registerGroup('ombi', 'Ombi');
			if (config.sonarr != "") this.client.registry.registerGroup('sonarr', 'Sonarr');
			if (config.radarr != "") this.client.registry.registerGroup('radarr', 'Radarr');
			if (config.tautulli != "") this.client.registry.registerGroup('tautulli', 'Tautulli');
			this.client.registry.registerCommandsIn(path.join(__dirname, 'commands'));
		}

		// login with client and bot token
		return this.client.login(this.token);
	}

	deinit () {
		this.isReady = false;
		return this.client.destroy();
	}
}

module.exports = Bot;