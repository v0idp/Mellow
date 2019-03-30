const express = require('express');
const session = require('express-session');
const path = require('path');
const BotClient = require('./BotClient.js');


class WebServer {
    constructor (db, bot) {
        this.path = path.join(__dirname, 'views/');
        this.app = express();
        this.db = db;
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
        this.db.loadSettings('bot').then((bot) => {
            this.bot = new BotClient(this.db, bot.token, (bot.ownerid) ? bot.ownerid : null, bot.commandprefix, bot.unknowncommandresponse);
            this.bot.init().catch(() => { console.error('Failed initializing BotClient. Is your token correct?') });
        }).catch((err) => console.error(err));
    }

    onCheckAuth() {
        return async (req, res) => {
            let post = req.body;
            this.db.loadSettings('general').then((table) => {
                if (post.username == table.username && post.password == table.password) {
                    req.session.user_id = 10000;
                    res.redirect('/config');
                } else {
                    res.render('login', {
                        loginMessage: 'Login failed! Username or password incorrect.'
                    });
                }
            });
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
            this.db.saveSettings(req);
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
                this.db.loadSettings('general').then((general) => {
                    if (general && req.session.user_id != 10000) {
                        res.render('login', {
                            loginMessage: ''
                        });
                    } else {
                        res.redirect('/config');
                    }
                });
                
            });
            this.app.post('/login', this.onCheckAuth());

            this.app.get('/config', async (req, res) => {
                let [general, bot, ombi, tautulli, sonarr, radarr] = await Promise.all([
                    this.db.loadSettings('general'),
                    this.db.loadSettings('bot'),
                    this.db.loadSettings('ombi'),
                    this.db.loadSettings('tautulli'),
                    this.db.loadSettings('sonarr'),
                    this.db.loadSettings('radarr')
                ]);

                if (req.session.user_id == 10000 || !general) {
                    res.render('config', {
                        currentView: this.currentView,
                        generalSettings: (general) ? general : '',
                        botSettings: (bot) ? bot : '',
                        ombiSettings:  (ombi) ? ombi : '',
                        tautulliSettings:  (tautulli) ? tautulli : '',
                        sonarrSettings:  (sonarr) ? sonarr : '',
                        radarrSettings:  (radarr) ? radarr : ''
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