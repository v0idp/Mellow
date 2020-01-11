const BotClient = require('./BotClient.js');
const WebServer = require('./WebServer.js');
const Database = require('./Database.js');

let bot = null;
const start = function () {
    const webDatabase = new Database();
    const botConfig = webDatabase.webConfig.bot;
    if (botConfig && botConfig.token) {
        bot = new BotClient(webDatabase, botConfig.ownerid, botConfig.commandprefix);
        bot.init().catch(() => { console.error('Failed initializing DiscordBot. Is your token correct?') });
    } else console.log('There is no bot token provided. Please check your configuration!');
    new WebServer(webDatabase, bot).init();
}

start();