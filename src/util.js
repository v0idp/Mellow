const request = require('request');
const Promise = require('bluebird');
const url = require('url');

const capitalizeFirstLetter = function (string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const momentFormat = function (date, client) {
	const moment = require('moment');

	return moment(date).format(`MMMM Do YYYY [at] ${client.provider.get('global', 'timeformat', '24') === '24' ? 'HH:mm:ss' : 'hh:mm:ss A'} [UTC]Z`);
}

const get = function(options) {
    return new Promise(function(resolve, reject) {
        request.get(options, function(error, response, body){
            if (!error && response.statusCode == 200) {
                resolve({response, body});
            } else {
                if (response) {
                    // return a status code to help with diagnosing api failures
                    reject({error, body, 'statusCode':response.statusCode});
                } else {
                    reject({error, body});
                }
            }
        });
    });
}

const post = function(options) {
    return new Promise(function(resolve, reject) {
        request.post(options, function(error, response, body) {
            if (!error && response.statusCode < 300) resolve({error, response, body});
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

const getURL = function(host, port, ssl, args) {
    return url.parse(`${(ssl === 'true') ? 'https://' : 'http://'}` +
        `${(host.match(/^http(s)?:\/\//)) ? host.split('//')[1] : host}` +
        `${(port) ? `:${port}` : ''}` +
        `${args}`).href;
}


const ucwords = function(str) {
    return (str + '')
        .replace(/^(.)|\s+(.)/g, function ($1) {
            return $1.toUpperCase();
        })
}

const replacePlaceholders = function(str, placerholders) {
    return str.replace(/%\w+%/g, (all) => {
        return placerholders[all] || all;
    });
}

module.exports = {
    checkURLPrefix,
    getURL,
	capitalizeFirstLetter,
	momentFormat,
	get,
    post,
    ucwords,
    replacePlaceholders
};
