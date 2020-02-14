const BotHandler = require('./bots/BotHandler.js');
const WebServer = require('./web/WebServer.js');
const { migrateALL } = require('./database/migration.js');
const { version } = require('../package.json');

start = async function () {
    console.log('#########################################');
    console.log(`####          Mellow v${version}          ####`);
    console.log('#### https://github.com/v0idp/Mellow ####');
    console.log('#########################################\n');

    const migErr = await migrateALL();
    if (migErr) console.log(migErr);

    const Database = require('./database/Database.js');
    const webDatabase = new Database();
    const botHandler = new BotHandler(webDatabase);
    botHandler.init();
    new WebServer(webDatabase, botHandler).init();
}

start();
