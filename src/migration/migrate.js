const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const newSettings = require('./settings_format.json');

const migrateSQLITE = function() {
    // TODO: Implement migration from SQL to JSON
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
                    console.log("Settings found! Migrating settings to new settings...");
                    migrated = false;
                    for (const key in oldSettings)
                        for (const k in oldSettings[key])
                            if (newSettings[key].hasOwnProperty(k))
                                newSettings[key][k] = oldSettings[key][k];
                }
                else {
                    console.log("Settings already migrated! Skipping...");
                }
            }
            else {
                migrated = false;
                console.log("No settings found! Creating new settings file...");
            }
        
            if (!migrated) fs.writeFileSync(settingsPath, JSON.stringify(newSettings));
            resolve();
        }
        catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    migrateSQLITE,
    migrateJSON
}