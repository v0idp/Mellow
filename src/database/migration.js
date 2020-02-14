const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const bcrypt = require('bcryptjs');
const newSettings = require('./settings_format.json');

const BCRYPT_PATTERN = /^\$2[ayb]\$.{56}$/

const migrateSQLITE = function() {
    return new Promise(async (resolve, reject) => {
        try {
            const databasePath = path.join(__dirname, '..', '..', 'data', 'WebSettings.sqlite3');
            const newSettingsPath = path.join(__dirname, '..', '..', 'data', 'settings.json');
            if (fs.existsSync(databasePath) ) {
                console.log("SQLite Settings found! Migrating settings to new settings...");
                const db = await sqlite.open(databasePath, { Promise });
                for (const table of ['general', 'bot', 'ombi', 'tautulli', 'sonarr', 'radarr']) {
                    const result =  await db.get('SELECT * FROM ' + table + ' WHERE id=1');
                    for (const key in result) {
                        if (key !== 'id' && newSettings[table].hasOwnProperty(key))
                            newSettings[table][key] = result[key];
                    }
                }
                await db.close();
                fs.writeFileSync(newSettingsPath, JSON.stringify(newSettings));
                fs.unlinkSync(databasePath, (err) => {
                    if (err) reject(err);
                });
            }
            else {
                console.log('No SQLite settings found! Skipping...');
            }
            resolve();
        }
        catch (err) {
            reject(err);
        }
    });
}

const migrateJSON = function() {
    return new Promise(async (resolve, reject) => {
        try {
            const settingsPath = path.join(__dirname, '..', '..', 'data', 'settings.json')
            let oldSettings;
            let migrated = true;
        
            if (fs.existsSync(settingsPath)) {
                oldSettings = require(settingsPath);
                
                if (!oldSettings.general.password.match(BCRYPT_PATTERN)) {
                    migrated = false
                    const salt = await bcrypt.genSalt(10);
                    const pwHash = await bcrypt.hash(oldSettings.general.password, salt);
                    oldSettings.general.password = pwHash;
                }

                const oProps = Object.getOwnPropertyNames(oldSettings);
                let oSize = oProps.length;
                let oPropSizes = [];
                oProps.forEach((prop) => {
                    oPropSizes.push(Object.getOwnPropertyNames(oldSettings[prop]).length);
                    oSize += Object.getOwnPropertyNames(oldSettings[prop]).length;
                });

                const nProps = Object.getOwnPropertyNames(newSettings);
                let nSize = nProps.length;
                let nPropSizes = [];
                nProps.forEach((prop) => {
                    nPropSizes.push(Object.getOwnPropertyNames(newSettings[prop]).length);
                    nSize += Object.getOwnPropertyNames(newSettings[prop]).length;
                });

                for (let i = 0; i < oPropSizes.length; i++)
                    if (oPropSizes[i] != nPropSizes[i])
                        migrated = false;

                if (oSize !== nSize || migrated === false) {
                    console.log("JSON Settings found! Migrating settings to new settings...");
                    migrated = false;
                }
                else {
                    console.log("JSON Settings already up-to-date! Skipping...");
                }

                if (!migrated)
                    for (const key in oldSettings)
                        for (const k in oldSettings[key])
                            if (newSettings[key].hasOwnProperty(k))
                                newSettings[key][k] = oldSettings[key][k];
            }
            else {
                console.log("No JSON settings found! Creating new JSON settings file...");
                migrated = false;
            }
        
            if (!migrated) fs.writeFileSync(settingsPath, JSON.stringify(newSettings));
            resolve();
        }
        catch (err) {
            reject(err);
        }
    });
}

const migrateALL = function() {
    return new Promise(async (resolve, reject) => {
        const sqlErr = await migrateSQLITE();
        if (sqlErr) reject(sqlErr);
        const jsonErr = await migrateJSON();
        if (jsonErr) reject(jsonErr);
        resolve();
    });
}

module.exports = {
    migrateSQLITE,
    migrateJSON,
    migrateALL
}
