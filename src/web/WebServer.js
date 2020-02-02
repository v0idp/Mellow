const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');
const BotClient = require('../bots/DiscordBot.js');
const router = require('./router.js');
const { version } = require('../../package.json');
const PORT = process.env.PORT || 5060;

module.exports = class WebServer {
    constructor (WebDatabase, bot) {
        this.path = path.join(__dirname, 'views/');
        this.app = express();
        this.WebDatabase = WebDatabase;
        this.bot = bot;
        this.currentView = 'general';
        this.successMsg = '';
        this.errorMsg = '';
    }

    onReady() {
        return () => {
            console.log(`WebServer ready and listening on port ${PORT}. Webroot for static files set to ${this.path}`);
        }
    }

    restartBot() {
        try {
            this.bot.deinit();
        } catch (err) {
            console.log('No BotClient is running to restart. Starting a new BotClient...');
        }
        const botConfig = this.WebDatabase.webConfig.bot;
        if (botConfig && botConfig.token) {
            this.bot = new BotClient(this.WebDatabase, botConfig.token, botConfig.ownerid, botConfig.commandprefix);
            this.bot.init().catch(() => { console.error('Failed initializing BotClient. Is your token correct?') });
        }
        else {
            console.log('No token provided! Aborting Discord Bot Restart...');
        }
    }

    async init () {
        try {
            this.app.set('view engine', 'ejs');
            this.app.set('views', this.path);

            this.app.use(express.json());
            this.app.use(cookieParser());
            this.app.use(express.urlencoded({extended: true}));
            this.app.use(express.static(this.path));
            this.app.use(passport.initialize());
            this.app.use(passport.session());

            this.app.locals.site = {
                version: version
            };

            this.app.use('/', (req, res, next) => {
                req.webserver = this;
                if (req.cookies.token) req.headers.authorization = req.cookies.token;
                next();
            }, router);

            this.app.listen(PORT, this.onReady());
        } catch(error) {
            console.log(error);
            console.error('Failed to start WebServer.');
        }
    }
}
