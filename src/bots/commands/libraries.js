module.exports = class librariesCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'libraries',
			'group': 'tautulli',
			'description': 'get a list of all libraries on your server',
			'examples': ['libraries'],
			'guildOnly': true
		};
	}
	
	hasPermission(user) {
		return true;
	}
    
    async run (msg) {
		this.client.api.tautulli.getLibraries().then((jsonResponse) => {
			this.client.deleteCommandMessages(msg);
			return this.client.send(msg, this.client.builder.buildTautulliEmbed(jsonResponse));
		}).catch(() => {
			this.client.deleteCommandMessages(msg);
			return this.client.reply(msg, 'Something went wrong! Couldn\'t get libraries.');
		});
    }
};
