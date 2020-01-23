const BotClient = require('./BotClient.js');
const WebServer = require('./web/WebServer.js');
const Database = require('./Database.js');
const { migrateALL } = require('./migration/migration.js');
const { version } = require('../package.json');

console.log(`Mellow v${version}`);
migrateALL().then(() => {
    let bot;
    const webDatabase = new Database();
    const botConfig = webDatabase.webConfig.bot;
    if (botConfig && botConfig.token) {
        bot = new BotClient(webDatabase, botConfig.ownerid, botConfig.commandprefix);
        bot.init().catch((err) => {
            console.log('Failed initializing DiscordBot! Please check your bot configurations.');
            console.error(err);
        });
    } else console.log('There is no bot token provided. Please check your configurations.');
    new WebServer(webDatabase, bot).init();
}).catch(console.error);
