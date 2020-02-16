const path = require('path');
const fs = require('fs');
const Discord = require('discord.js');
const MsgBuilder = require('./DiscordMsgBuilder.js');

module.exports = class DiscordBot extends Discord.Client {
    constructor (db, api, token) {
        super();
        this.db = db;
        this.api = api;
        this.builder = MsgBuilder;
        this.config = null;
        this.commands = {};
        this.token = token;
        this.invite = 'https://discord.gg/zx2BWp2';
    }

    send (msg, text) {
        return msg.channel.send(text);
    }

    reply (msg, text) {
        return msg.reply(text);
    }

    dm (msg, text) {
        if (msg.channel.type !== 'dm')
            return msg.author.send(text).catch((err) => this.reply(msg, text));
        else
            msg.channel.send(text);
    }

    awaitSelection (msg, resultMsg, length) {
        return new Promise(async (resolve, reject) => {
            if (this.config.selection === 'emoji') {
                const limit = (length <= 10) ? length : 10;
                const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
                for (let i = 0; i < limit; i++) await resultMsg.react(emojis[i]);
                resultMsg.awaitReactions((reaction, user) => emojis.includes(reaction.emoji.name) && user.id === msg.author.id, { max: 1, time: 120000 })
                .then((collected) => {
                    resultMsg.delete();
                    if (collected.first()) resolve(emojis.indexOf(collected.first().emoji.name));
                }).catch(() => {
                    resolve(-1);
                });
            }
            else {
                resultMsg.channel.awaitMessages(m => (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) && m.author.id == msg.author.id, { max: 1, time: 120000, errors: ['time'] })
                .then((collected) => {
                    let message = collected.first().content;
                    let selection = parseInt(message);
                    resultMsg.delete();
                    if (collected.first().deletable) collected.first().delete();
                    if (message.startsWith('cancel')) {
                        return this.reply(msg, 'Cancelled command.');
                    }
                    else if (selection >= 0 && selection <= length)
                        resolve(selection);
                    else
                        resolve(-1);
                }).catch(() => {
                    reject(-1);
                })
            }
        });
    }

    awaitRequest (msg, resultMsg) {
        return new Promise(async (resolve, reject) => {
            resultMsg.awaitReactions((reaction, user) => reaction.emoji.name === '⬇' && user.id === msg.author.id, { max: 1, time: 120000 })
            .then((collected) => {
                if (collected.first()) resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    deleteCommandMessages (msg) {
		if (msg.deletable && this.config.deletecommandmessages === 'true') {
			msg.delete();
		}
	}

    registerEvents () {
        fs.readdir(path.join(__dirname, 'events'), (err, files) => {
            if (err) return console.log(err);
            files.forEach(file => {
                const eventFunction = require(`./events/${file}`);
                const eventName = file.split(".")[0];
                this.on(eventName, async (...args) => eventFunction.run(this, ...args));
            });
        });
    }

    registerCommands (groups) {
        fs.readdir(path.join(__dirname, '..', 'commands'), (err, files) => {
            if (err) return console.log(err);
            files.forEach(file => {
                const commandFunction = require(path.join(__dirname, '..', 'commands', file));
                const commandName = file.split(".")[0];
                const command = new commandFunction(this);
                if (command.options.group && !groups.includes(command.options.group)) return;
                if (command.options.group && (!this.db.config[command.options.group].host || !this.db.config[command.options.group].apikey)) return;
                if (command.options.aliases) command.options.aliases.forEach((alias) => this.commands[alias] = command);
                this.commands[commandName] = command;
            });
        });
    }

    test () {
        return new Promise((resolve, reject) => {
            try {
                this.login(this.token)
                .then(() => resolve(this))
                .catch((err) => reject(err));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    init () {
        return new Promise((resolve, reject) => {
            try {
                this.config = this.db.config['bot'];
                this.config.commandprefix = this.config.commandprefix || "-";

                this.registerEvents();
                this.registerCommands(['ombi', 'sonarr', 'radarr', 'tautulli']);

                this.login(this.token)
                .then(() => resolve(this))
                .catch((err) => reject(err));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    deinit() {
        this.destroy();
    }
}
