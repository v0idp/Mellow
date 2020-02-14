const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');
const BotHandler = require('../bots/BotHandler.js');
const router = require('./router.js');
const { version } = require('../../package.json');
const PORT = process.env.PORT || 5060;

module.exports = class WebServer {
    constructor (WebDatabase, botHandler) {
        this.path = path.join(__dirname, 'views/');
        this.app = express();
        this.WebDatabase = WebDatabase;
        this.botHandler = botHandler;
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
        this.botHandler.deinit();
        this.botHandler = new BotHandler(this.WebDatabase);
        this.botHandler.init();
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
