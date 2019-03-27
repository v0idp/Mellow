const Commando = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');
const {post} = require('./util.js');

class BotClient extends Commando.Client {
	constructor (webDB, token, ownerid, commandprefix, unknowncommandresponse) {
		super({
			"owner": (ownerid) ? ownerid : null,
			"commandPrefix": commandprefix,
			"unknownCommandResponse": unknowncommandresponse
		});
		this.webDB = webDB;
		this.token = token;
		this.isReady = false;
	}

	onReady () {
		return () => {
			console.log(`BotClient ready and logged in as ${this.user.tag} (${this.user.id}). Prefix set to ${this.commandPrefix}. Use ${this.commandPrefix}help to view the commands list!`);
			this.user.setAFK(true);
			this.user.setActivity(`${this.commandPrefix}help`, { type: 'PLAYING' });
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

	refreshToken () {
		return new Promise((resolve, reject) => {
			this.webDB.loadSettings('ombi').then((ombi) => {
				post({
					headers: {
						'accept' : 'application/json',
						'Content-Type': 'application/json',
						'User-Agent': `Mellow/${process.env.npm_package_version}`
					},
					url: 'https://' + ombi.host + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/token',
					body: JSON.stringify({username:ombi.username, password:ombi.password})
				}).then(({response, body}) => {
					let {access_token, expiration} = JSON.parse(body)
					this.accessToken = access_token
					console.log("Refreshed Access Token")
					setTimeout(this.refreshToken, new Date(expiration).getTime() - Date.now())
					resolve()
				}).catch((error) => {
					console.error(error)
					setTimeout(this.refreshToken, 5 * 60 * 1000)
					reject()
				})
			})
		})
	}

	async init () {
		// register our events for logging purposes
		this.on('ready', this.onReady())
			.on('commandPrefixChange', this.onCommandPrefixChange())
			.on('error', console.error)
			.on('warn', console.warn)
			//.on('debug', console.log)
			.on('disconnect', this.onDisconnect())
			.on('reconnecting', this.onReconnect())
			.on('commandError', this.onCmdErr())
			.on('commandBlocked', this.onCmdBlock())
			.on('commandStatusChange', this.onCmdStatusChange())
			.on('groupStatusChange', this.onGroupStatusChange())
			.on('message', this.onMessage());

		// set provider sqlite so we can actually save our config permanently
		this.setProvider(
			sqlite.open(path.join(__dirname.slice(0, -3), 'data/BotSettings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
		).catch(console.error);

		// first we register groups and commands
		this.registry
			.registerDefaultGroups()
			.registerGroups([
				['ombi', 'Ombi'],
				['sonarr', 'Sonarr'],
				['radarr', 'Radarr'],
				['tautulli', 'Tautulli']
			])
			.registerDefaultTypes()
			.registerDefaultCommands({
				'help': true,
				'prefix': true,
				'ping': true,
				'eval_': false,
				'commandState': true
		}).registerCommandsIn(path.join(__dirname, 'commands'));

		// unregister groups if apikey and host is not provided in web database
		// thanks to the commando framework we have to go the dirty way
		this.registry.groups.forEach((group) => {
			this.webDB.loadSettings(group.name).then((result) => {
				if(!result || (!result.host && !result.username && !result.password)) {
					group.commands.forEach((command) => {
						this.registry.unregisterCommand(command);
					});
				}
			}).catch(() => {});
		});

		// get the access token from Ombi
		await this.refreshToken()

		// login client with bot token
		return this.login(this.token);
	}

	deinit () {
		this.isReady = false;
		return this.destroy();
	}
}

module.exports = BotClient;