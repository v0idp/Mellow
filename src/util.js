const request = require('request');
const Promise = require('bluebird');
const path = require('path');
const webConfig = require(path.join(__dirname, '..', 'data', 'settings.json'));

const deleteCommandMessages = function (msg) {
    if (msg.deletable && (webConfig.bot.deletecommandmessages) === 'true' ? true : false) {
        return msg.delete();
    }
};

const capitalizeFirstLetter = function (string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const momentFormat = function (date, client) {
	const moment = require('moment');

	return moment(date).format(`MMMM Do YYYY [at] ${client.provider.get('global', 'timeformat', '24') === '24' ? 'HH:mm:ss' : 'hh:mm:ss A'} [UTC]Z`);
};

const get = function(options) {
    return new Promise(function(resolve, reject) {
        request.get(options, function(error, response, body){
            if (!error && response.statusCode == 200) resolve({response, body});
            else reject({error, body});
        });
    });
}

const post = function(options) {
    return new Promise(function(resolve, reject) {
        request.post(options, function(error, response, body){
            if (!error && response.statusCode == 200) resolve({error, response, body});
            else reject({error, body});
        });
    });
}

const checkURLPrefix = function(url) {
    if (/https?:\/\//.exec(url)) {
        return true;
    } else {
	return false;
    }
}

module.exports = {
	checkURLPrefix,
	capitalizeFirstLetter,
	deleteCommandMessages,
	momentFormat,
	get,
    post
};
