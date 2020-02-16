const APIHandler = require('../api/api.js');
const DiscordBot = require('./discord/DiscordBot.js');

module.exports = class BotHandler {
    constructor (webDatabase) {
        this.db = webDatabase;
        this.api = new APIHandler(webDatabase.config);
        this.bots = [];
    }

    init() {
        return new Promise((resolve) => {
            const bot = this.db.config.bot;
            if (bot && bot.token) {
                new DiscordBot(this.db, this.api, bot.token).init(bot.token, bot.commandprefix).then((discordBot) => {
                    this.bots.push(discordBot);
                }).catch((err) => console.log(err));
            }
            else
                console.log("No Discord Bot Token provided. Please check your configuration.");
            
            resolve(this.bots);
        });
    }

    deinit() {
        this.bots.forEach((e) => e.deinit());
    }
}
