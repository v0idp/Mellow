const sqlite = require('sqlite');
const Promise = require('bluebird');
const path = require('path');
var fs = require('fs');

class Database {
    constructor(dbName) {
        this.path = path.join(__dirname.slice(0, -3), 'data/' + dbName + '.sqlite3');
        this.db;
    }

    getDB() {
        return this.db;
    }

    loadSettings(table) {
        return new Promise(async (resolve, reject) => {
            try {
                let result =  await this.db.get('SELECT * FROM ' + table + ' WHERE id=1');
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    saveSettings(request) {
        if (request.path == '/general') {
            this.db.run('DELETE FROM general');
            this.db.run('INSERT INTO general (username, password) VALUES(?, ?)',
                [request.body.username, request.body.password]);
        } else if (request.path == '/bot') {
            this.db.run('DELETE FROM bot');
            this.db.run('INSERT INTO bot (token, ownerid, commandprefix, deletecommandmessages, unknowncommandresponse, channelname) VALUES(?, ?, ?, ?, ?, ?)',
                [request.body.token, request.body.ownerID, request.body.commandPrefix, (request.body.deleteCommandMessages) ? 'true' : 'false', (request.body.unknownCommandResponse) ? 'true' : 'false', request.body.channelName]);
        } else if (request.path == '/ombi' && request.body.apiKey != '' && request.body.host != '') {
            this.db.run('DELETE FROM ' + request.path.replace('/', ''));
            this.db.run('INSERT INTO ombi (host, port, apikey, requesttv, requestmovie, username) VALUES(?, ?, ?, ?, ?, ?)',
                [request.body.host, request.body.port, request.body.apiKey, request.body.requestTV, request.body.requestMovie, request.body.userName]);
        } else if ((request.path == '/tautulli' || request.path == '/sonarr' || request.path == '/radarr') && request.body.apiKey != '' && request.body.host != '') {
            this.db.run('DELETE FROM ' + request.path.replace('/', ''));
            this.db.run('INSERT INTO placeholder (host, port, apikey) VALUES(?, ?, ?)'.replace('placeholder', request.path.replace('/', '')),
                [request.body.host, request.body.port, request.body.apiKey]);
        } else {
            return;
        }
    }

    openDB(path) {
        return new Promise(async (resolve, reject) => {
            try {
                let dataPath = __dirname.slice(0, -3) + 'data';
                if (!fs.existsSync(dataPath)) {
                    fs.mkdirSync(dataPath);
                }

                const dbPromise = sqlite.open(path, { Promise });
                let db = await dbPromise;
                resolve(db);
            } catch(error) {
                reject(error);
            }
        });
    }

    init() {
        return new Promise(async (resolve, reject) => {
            this.openDB(this.path).then(db => {
                this.db = db;
                this.db.migrate();
                resolve(this.db);
            }).catch((err) => reject(err));
        });
    }
}

module.exports = Database;
