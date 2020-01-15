const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const newSettings = require('./settings_format.json');

const migrateSQLITE = function() {
    return new Promise((resolve, reject) => {
        try {
            // TODO: Implement migration from SQLITE to JSON
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
                migrated = false;
                console.log("No JSON settings found! Creating new JSON settings file...");
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
        Promise.all([migrateSQLITE(), migrateJSON()]).then(() => resolve()).catch((err) => reject(err));
    });
}

module.exports = {
    migrateSQLITE,
    migrateJSON,
    migrateALL
}
