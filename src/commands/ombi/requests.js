const Discord = require('discord.js');
const commando = require('discord.js-commando');
const {deleteCommandMessages, get, post} = require('../../util.js');

function getRequests(ombi) {
	return new Promise((resolve, reject) => {
		get({
			headers: {'accept' : 'application/json',
			'ApiKey': ombi.apikey,
			'User-Agent': `Mellow/${process.env.npm_package_version}`},
			url: 'https://' + ombi.host + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/Request/movie'
		})
		.then(({response, body}) => {
			let movieRequests = JSON.parse(body).filter(r => !r.available && !r.denied)
			get({
				headers: {'accept' : 'application/json',
				'ApiKey': ombi.apikey,
				'User-Agent': `Mellow/${process.env.npm_package_version}`},
				url: 'https://' + ombi.host + ((ombi.port) ? ':' + ombi.port : '') + '/api/v1/Request/tv'
			})
			.then(({response, body}) => {
				let tvRequests = JSON.parse(body).filter(r => !r.childRequests[0].available && !r.childRequests[0].denied)
				resolve({movieRequests, tvRequests})
			})
			.catch((error) => reject(error))
		})
		.catch((error) => reject(error))
	})
}

module.exports = class getRequestsCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'requests',
			'memberName': 'requests',
			'group': 'ombi',
			'description': 'get requests from ombi',
			'examples': [],
			'guildOnly': true,
			'args': []
		});
	}

	async run (msg, args) {
		let ombi = await this.client.webDB.loadSettings('ombi')

		getRequests(ombi)
		.then(({movieRequests, tvRequests}) => {
			let showEmbed = new Discord.MessageEmbed()
			showEmbed.setTitle('Ombi Requests')
			.setDescription(`There are currently ${movieRequests.length + tvRequests.length} requests`)
			
			if (movieRequests.length) {
				let fieldContent = ""
				movieRequests.forEach((movie,i) => {
					fieldContent += `${movie.title} [${movie.approved ? "Processing" : "Pending"}]\n`
				})
				showEmbed.addField("Movies", fieldContent)
			}
			if (tvRequests.length) {
				let fieldContent = ""
				tvRequests.forEach((show,i) => {
					fieldContent += `${show.title} [${show.childRequests[0].approved ? "Processing" : "Pending"}]\n`
				})
				showEmbed.addField("TV Shows", fieldContent)
			}

			msg.embed(showEmbed);
		})
		.catch((error) => {
			console.error(error)
			msg.reply('There was an error in your request.')
		})
	}
};