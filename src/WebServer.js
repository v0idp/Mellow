const express = require('express');
const session = require('express-session');
const path = require('path');
const BotClient = require('./BotClient.js');

const {get, getURL, ucwords} = require('./util.js');


class WebServer {
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
        if (botConfig && botConfig.token) {
            this.bot = new BotClient(this.WebDatabase, botConfig.ownerid, botConfig.commandprefix);
            this.bot.init().catch(() => { console.error('Failed initializing BotClient. Is your token correct?') });
        }
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
                    title: 'Mellow Login',
                    errorMsg: 'Login failed! Username or password incorrect.',
                    successMsg: ''
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

            this.successMsg = ucwords(this.currentView) + ' configuration saved.';

            res.redirect('/config');
        }
    }

    testApi(api) {
        return (req, res) => {
            //let config = this.WebDatabase.webConfig;
            let config = req.body;
            let url;
            let apiHeader = {};

            switch (api) {
                case "ombi":
                    apiHeader = {'ApiKey': config.apikey};
                    // removed Status URL - currently works without an API key:
                    // url = getURL(config.ombi.host, config.ombi.port, config.ombi.ssl, config.ombi.baseurl + '/api/v1/Status/info');

                    // For the moment, get the most popular movie list
                    url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v1/Search/movie/popular');
                    break;
                case "tautulli":
                    url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/v2?apikey=' + config.apikey + '&cmd=status');
                    break;
                case "sonarr":
                    url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/system/status?apikey=' + config.apikey);
                    console.log(url);
                    break;
                case "radarr":
                    url = getURL(config.host, config.port, config.ssl, config.baseurl + '/api/system/status?apikey=' + config.apikey);
                    break;
                default:
                    // no idea what api it is, so fail anyway
                    res.status(500).send(JSON.stringify({'status': 'error'}));
                    break;
            }

            if (url) {
                let defaultHeaders = {
                    'accept': 'application/json',
                    'User-Agent': `Mellow/${process.env.npm_package_version}`
                };

                let requestHeaders = {...defaultHeaders, ...apiHeader};

                get({
                    headers: requestHeaders,
                    url: url
                }).then((resolve) => {
                    res.setHeader('Content-Type', 'application/json');

                    // check that there is actually JSON supplied
                    try {
                        JSON.parse(resolve.body);
                        res.send(resolve.body);
                    } catch (e) {
                        res.status(500).send(JSON.stringify({...{response: error}, ...{status: 'error'}}));
                    }
                }).catch((error) => {
                    // if there was an error, throw a 500 and provide more details on the error, if available
                    res.status(500).send(JSON.stringify({...{response: error}, ...{status: 'error'}}));
                });
            }
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
                        title: 'Mellow Login',
                        successMsg: this.successMsg,
                        errorMsg: this.errorMsg
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
                        title: 'Mellow Configuration',
                        successMsg: this.successMsg,
                        errorMsg: this.errorMsg,
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
                // then unset the messages
                this.successMsg = this.errorMsg = '';
            });
            this.app.post('/general', this.onConfigSave());
            this.app.post('/bot', this.onConfigSave());
            this.app.post('/ombi', this.onConfigSave());
            this.app.post('/tautulli', this.onConfigSave());
            this.app.post('/sonarr', this.onConfigSave());
            this.app.post('/radarr', this.onConfigSave());
            this.app.post('/logout', this.onLogout());

            this.app.post('/ombi/test', this.testApi('ombi'));
            this.app.post('/tautulli/test', this.testApi('tautulli'));
            this.app.post('/sonarr/test', this.testApi('sonarr'));
            this.app.post('/radarr/test', this.testApi('radarr'));

            this.app.listen(5060, this.onReady());
        } catch(error) {
            console.error(error);
            console.error('Failed to start WebServer.');
        }
    }
}

module.exports = WebServer;