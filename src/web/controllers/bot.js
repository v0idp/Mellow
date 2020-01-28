const BotClient = require('../../bots/DiscordBot.js');
const Database = require('../../database/Database.js');

const test = async (req, res) => {
    let bot;
    const webDatabase = new Database();
    const botConfig = req.body;
    if (botConfig && botConfig.token) {
        bot = new BotClient(webDatabase, botConfig.token, botConfig.ownerid, botConfig.commandprefix);
        bot.init().then((result) => {
            bot.deinit();
            res
            .status(200)
            .send({token: result});
        }).catch((err) => {
            bot.deinit();
            console.log('Failed initializing DiscordBot! Please check your bot configurations.');
            res
            .status(500)
            .send(JSON.stringify({...{response: err}, ...{status: 'error'}}));
        });
    } else {
        console.log('There is no bot token provided. Please check your configurations.');
        res
        .status(500)
        .send(JSON.stringify({...{response: 'no bot token provided.'}, ...{status: 'error'}}));
    }
}

module.exports = {
    test
}
