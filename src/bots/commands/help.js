module.exports = class helpCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'help',
			'description': 'get a list of all commands on your server',
			'examples': ['help'],
			'guildOnly': false
		};
	}
	
	hasPermission(user) {
		return true;
	}
    
    async run (msg, args) {
        if (msg.channel.type !== 'dm') this.client.reply(msg, 'Sent you a DM with information.');
        if (args.length === 0)
            return this.client.dm(msg, this.client.builder.buildHelpAllMsg(this.client, this.client.commands));
        else if (this.client.commands.hasOwnProperty(args.join(' ')))
            return this.client.dm(msg, this.client.builder.buildHelpCommandMsg(this.client.commands[args.join(' ')]));
        else
            return this.client.dm(msg, 'Command does not exist!');
    }
};
