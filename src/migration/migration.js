const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const newSettings = require('./settings_format.json');

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
    return new Promise((resolve, reject) => {
        try {
            const settingsPath = path.join(__dirname, '..', '..', 'data', 'settings.json')
            let oldSettings;
            let migrated = true;
        
            if (fs.existsSync(settingsPath)) {
                oldSettings = require(settingsPath);

                const oProps = Object.getOwnPropertyNames(oldSettings);
                let oSize = oProps.length;
                oProps.forEach((prop) => oSize += Object.getOwnPropertyNames(oldSettings[prop]).length);

                const nProps = Object.getOwnPropertyNames(newSettings);
                let nSize = nProps.length;
                nProps.forEach((prop) => nSize += Object.getOwnPropertyNames(newSettings[prop]).length);

                if (oSize !== nSize) {
                    console.log("JSON Settings found! Migrating settings to new settings...");
                    migrated = false;
                    for (const key in oldSettings)
                        for (const k in oldSettings[key])
                            if (newSettings[key].hasOwnProperty(k))
                                newSettings[key][k] = oldSettings[key][k];
                }
                else {
                    console.log("JSON Settings already up-to-date! Skipping...");
                }
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
    return new Promise((resolve, reject) => {
        migrateSQLITE().then(() => migrateJSON().then(() => resolve())
            .catch((err) => reject(err))).catch((err) => reject(err));
    });
}

module.exports = {
    migrateSQLITE,
    migrateJSON,
    migrateALL
}
