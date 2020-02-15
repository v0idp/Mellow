module.exports = class refreshLibrariesCommand {
	constructor (client) {
		this.client = client;
		this.options = {
			'name': 'refreshlibraries',
			'group': 'tautulli',
			'description': 'refresh all libraries in tautulli',
			'examples': ['refreshlibraries'],
			'guildOnly': true
		}
	}
	
	hasPermission(user) {
		return true;
	}
    
    async run (msg) {
		this.client.api.tautulli.refreshLibraries().then(() => {
			this.client.deleteCommandMessages(msg);
			return this.client.reply(msg, 'Refreshed all libraries in Tautulli.');
		}).catch(() => {
			return this.client.reply(msg, 'Something went wrong! Couldn\'t refresh libraries.');
		});
    }
};
