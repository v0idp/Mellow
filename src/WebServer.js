const express = require('express');
const session = require('express-session');
const path = require('path');
const BotClient = require('./BotClient.js');


class WebServer {
    constructor (WebDatabase, bot) {
        this.path = path.join(__dirname, 'views/');
        this.app = express();
        this.WebDatabase = WebDatabase;
        this.bot = bot;
        this.currentView = 'general';
    }

    onReady() {
        return () => {
            console.log(`WebServer ready and listening on port 5060. Webroot for static files set to ${this.path}`);
        }
    }

    restartBot() {
        try {
            this.bot.deinit();
        } catch (err) {
            console.log('No BotClient is running to restart. Starting a new BotClient...');
        }
        const botConfig = this.WebDatabase.webConfig.bot;
        this.bot = new BotClient(this.WebDatabase, botConfig.ownerid, botConfig.commandprefix);
        this.bot.init().catch(() => { console.error('Failed initializing BotClient. Is your token correct?') });
    }

    onCheckAuth() {
        return (req, res) => {
            const post = req.body;
            const table = this.WebDatabase.webConfig.general;
            if (post.username == table.username && post.password == table.password) {
                req.session.user_id = 10000;
                res.redirect('/config');
            } else {
                res.render('login', {
                    loginMessage: 'Login failed! Username or password incorrect.'
                });
            }
        }
    }

    onLogout() {
        return (req, res) => {
            if (req.session == undefined) {
                res.redirect('/login');
            } else if (req.session.user_id == undefined) {
                res.redirect('/login');
            } else {
                delete req.session.user_id;
                res.redirect('/login');
            }
        }
    }

    onConfigSave() {
        return (req, res) => {
            this.WebDatabase.saveConfig(req);
            this.restartBot();

            this.currentView = req.path.replace('/', '');
            res.redirect('/config');
        }
    }

    async init () {
        try {
            this.app.set('view engine', 'ejs');
            this.app.set('views', this.path);

            this.app.use(express.json());
            this.app.use(express.urlencoded({extended: true}));
            this.app.use(session({ resave: true, secret: 'asdkjn2398easojdfh9238hrihsf', saveUninitialized: true}));
            this.app.use(express.static(this.path));
    
            this.app.get('/', (req, res) => res.redirect('/login'));
            this.app.get('/login', async (req, res) => {
                if (req.session.user_id != 10000) {
                    res.render('login', {
                        loginMessage: ''
                    });
                } else {
                    res.redirect('/config');
                }
            });
            this.app.post('/login', this.onCheckAuth());

            this.app.get('/config', async (req, res) => {
                if (req.session.user_id == 10000 || !this.WebDatabase.webConfig.general) {
                    const config = this.WebDatabase.webConfig;
                    res.render('config', {
                        currentView: this.currentView,
                        generalSettings: (config.general) ? config.general : '',
                        botSettings: (config.bot) ? config.bot : '',
                        ombiSettings:  (config.ombi) ? config.ombi : '',
                        tautulliSettings:  (config.tautulli) ? config.tautulli : '',
                        sonarrSettings:  (config.sonarr) ? config.sonarr : '',
                        radarrSettings:  (config.radarr) ? config.radarr : ''
                    });
                } else {
                    res.redirect('/login');
                }
            });
            this.app.post('/general', this.onConfigSave());
            this.app.post('/bot', this.onConfigSave());
            this.app.post('/ombi', this.onConfigSave());
            this.app.post('/tautulli', this.onConfigSave());
            this.app.post('/sonarr', this.onConfigSave());
            this.app.post('/radarr', this.onConfigSave());
            this.app.post('/logout', this.onLogout());

            this.app.listen(5060, this.onReady());
        } catch(error) {
            console.error(error);
            console.error('Failed to start WebServer.');
        }
    }
}

module.exports = WebServer;