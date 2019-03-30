const request = require('request');
const Promise = require('bluebird');

const deleteCommandMessages = function (msg, client) {
    if (msg.deletable && client.provider.get('global', 'deletecommandmessages', false)) {
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
            else reject(error);
        });
    });
}

const post = function(options) {
    return new Promise(function(resolve, reject) {
        request.post(options, function(error, response, body){
            if (!error && response.statusCode == 200) resolve({response, body});
            else reject(error);
        });
    });
}

module.exports = {
	capitalizeFirstLetter,
	deleteCommandMessages,
	momentFormat,
	get,
    post
};