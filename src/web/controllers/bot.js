const DiscordBot = require('../../bots/discord/DiscordBot.js');

const test = async (req, res) => {
    let bot;
    const botConfig = req.body;
    if (botConfig && botConfig.token) {
        bot = new DiscordBot(null, null, botConfig.token);
        bot.init().then((result) => {
            console.log("DiscordBot Test was successfull!");
            bot.destroy();
            res
            .status(200)
            .send({token: result});
        }).catch((err) => {
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
