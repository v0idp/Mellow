const BotClient = require('./bots/DiscordBot.js');
const WebServer = require('./web/WebServer.js');
const { migrateALL } = require('./database/migration.js');
const { version } = require('../package.json');

console.log('#########################################');
console.log(`####          Mellow v${version}         ####`);
console.log('#### https://github.com/v0idp/Mellow ####');
console.log('#########################################\n');

migrateALL().then(() => {
    let bot;
    const Database = require('./database/Database.js');
    const webDatabase = new Database();
    const botConfig = webDatabase.webConfig.bot;
    if (botConfig && botConfig.token) {
        bot = new BotClient(webDatabase, botConfig.token, botConfig.ownerid, botConfig.commandprefix);
        bot.init().catch((err) => {
            console.log('Failed initializing DiscordBot! Please check your bot configurations.');
            console.error(err);
        });
    } else console.log('There is no bot token provided. Please check your configurations.');
    new WebServer(webDatabase, bot).init();
}).catch(console.error);
