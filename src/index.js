const Bot = require('./Bot.js');
const config = require('./config.json');

let start = function () {
    new Bot(config.general.token, false).init();
}

start();