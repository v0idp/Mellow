const path = require('path');
const Discord = require('discord.js');
const { capitalizeFirstLetter } = require('../../util.js');

const buildHelpAllMsg = function(client, commands) {
    let helpMsg =   `To run a command in Mellow, use \`\`${client.config.commandprefix}command\`\`.\n` +
                    `To run a command in this DM, use \`\`command\`\` with no prefix.\n\n` +
                    'Use ``help <command>`` to view detailed information about a specific command.\n\n' +
                    `__**Discord Support Server**__\n` +
                    `${client.invite}\n\n` +
                    `__**Available commands in Mellow**__\n\n` +
                    '__Commands__\n';

    for (const command in commands) {
        helpMsg += `**${commands[command].options.name}**: *${commands[command].options.description}*\n`;
    }

    return helpMsg;
}

const buildHelpCommandMsg = function(command) {
    let helpMsg =   `__Command **${command.options.name}**__: ${command.options.description} ${(command.options.guildOnly) ? '(Usable only in servers)' : ''}\n\n` +
                    `**Group:** ${(command.options.group) ? capitalizeFirstLetter(command.options.group) : 'General'}\n` +
                    `**Examples:**\n`;

    command.options.examples.forEach((example) => helpMsg += `${example}\n`);

    return helpMsg;
}

const buildTautulliEmbed = function(object) {
    let libraryEmbed = new Discord.RichEmbed()
    .setTitle('Server Libraries')
    .setTimestamp(new Date())
    .attachFile(path.join(__dirname, '..', '..', 'resources', 'libraries.png'))
    .setThumbnail('attachment://libraries.png');
    for (let i = 0; i < Object.keys(object.response.data).length; i++) {
        let obj = object.response.data[i];
        if (obj.section_type == 'movie') {
            libraryEmbed.addField(obj.section_name, obj.count, true);
        } else if (obj.section_type == 'show') {
            libraryEmbed.addField(obj.section_name, `${obj.count} Shows\n${obj.parent_count} Seasons\n${obj.child_count} Episodes`, true);
        }
    }
    return libraryEmbed;
}

const buildOmbiMovieEmbed = function(msg, movie) {
    let movieEmbed = new Discord.RichEmbed()
    .setTitle(`${movie.title} ${(movie.releaseDate) ? `(${movie.releaseDate.split('T')[0].substring(0,4)})` : ''}`)
    .setDescription(movie.overview.substr(0, 250) + '(...)')
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setImage('https://image.tmdb.org/t/p/w500' + movie.posterPath)
    .setURL('https://www.themoviedb.org/movie/' + movie.theMovieDbId)
    .attachFile(path.join(__dirname, '..', '..', 'resources', 'tmdb.png'))
    .setThumbnail('attachment://tmdb.png');

    if (movie.available) movieEmbed.addField('__Available__', '✅', true);
    if (movie.quality) movieEmbed.addField('__Quality__', `${movie.qualityp}p` , true);
    if (movie.requested) movieEmbed.addField('__Requested__', '✅', true);
    if (movie.approved) movieEmbed.addField('__Approved__', '✅', true);
    if (movie.plexUrl) movieEmbed.addField('__Plex__', `[Watch now](${movie.plexUrl})`, true);
    if (movie.embyUrl) movieEmbed.addField('__Emby__', `[Watch now](${movie.embyUrl})`, true);

    return movieEmbed;
}

const buildOmbiSeriesEmbed = function(msg, series) {
    let seriesEmbed = new Discord.RichEmbed()
    .setTitle(`${series.title} ${(series.firstAired) ? `(${series.firstAired.substring(0,4)})` : ''}`)
    .setDescription(series.overview.substr(0, 250) + '(...)')
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setImage(series.banner)
    .setURL(`https://www.thetvdb.com/?id=${series.id}&tab=series`)
    .attachFile(path.join(__dirname, '..', '..', 'resources', 'tvdb.png'))
    .setThumbnail('attachment://tvdb.png')
    .addField('__Network__', series.network, true)
    .addField('__Status__', series.status, true);

    if (series.available) seriesEmbed.addField('__Available__', '✅', true);
    if (series.quality) seriesEmbed.addField('__Quality__', series.quality, true);
    if (series.requested) seriesEmbed.addField('__Requested__', '✅', true);
    if (series.approved) seriesEmbed.addField('__Approved__', '✅', true);
    if (series.plexUrl) seriesEmbed.addField('__Plex__', `[Watch now](${series.plexUrl})`, true);
    if (series.embyUrl) seriesEmbed.addField('__Emby__', `[Watch now](${series.embyUrl})`, true);

    return seriesEmbed;
}

const buildOmbiMovieResults = function(selection, data) {
    let fieldContent = '';
    for (let i = 0; i < data.length; i++) {
        if (fieldContent.length > 896) break;
        fieldContent += `${i}) ${data[i].title} `;
        if (data[i].releaseDate) fieldContent += `(${data[i].releaseDate.substring(0,4)}) `;
        fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${data[i].theMovieDbId})]\n`;
    }

    let dataEmbed = new Discord.RichEmbed()
    dataEmbed.setTitle('Ombi Movie Search')
    .setDescription(`Please select one of the search results. ${(selection === 'emoji') ? '**Wait for the reactions to finish!**' : 'To abort answer **cancel**'}`)
    .addField('__Search Results__', fieldContent);

    return dataEmbed;
}

const buildOmbiSeriesResults = function(selection, data) {
    let fieldContent = '';
    for (let i = 0; i < data.length; i++) {
        if (fieldContent.length > 896) break;
        fieldContent += `${i}) ${data[i].title} `;
        if (data[i].firstAired) fieldContent += `(${data[i].firstAired.substring(0,4)}) `;
        fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${data[i].id}&tab=series)]\n`;
    }

    let dataEmbed = new Discord.RichEmbed();
    dataEmbed.setTitle('Ombi Series Search')
    .setDescription(`Please select one of the search results. ${(selection === 'emoji') ? '**Wait for the reactions to finish!**' : 'To abort answer **cancel**'}`)
    .addField('__Search Results__', fieldContent);

    return dataEmbed;
}

const buildSonarrSeriesEmbed = function(msg, series) {
    let seriesEmbed = new Discord.RichEmbed()
    .setTitle(`${series.title} (${series.year})`)
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setImage(series.remotePoster)
    .setURL(`https://www.thetvdb.com/?id=${series.tvdbId}&tab=series`)
    .attachFile(path.join(__dirname, '..', '..', 'resources', 'tvdb.png'))
    .setThumbnail('attachment://tvdb.png')
    .addField('__Network__', series.network, true)
    .addField('__Status__', series.status, true)
    .addField('__Seasons__', series.seasonCount, true)

    if (series.overview) seriesEmbed.setDescription(series.overview.substr(0, 250) + '(...)');
    if (series.certification) seriesEmbed.addField('__Certification__', series.certification, true);
    if (series.id) seriesEmbed.addField('__Added__', '✅', true);

    return seriesEmbed;
}

const buildSonarrSeriesResults = function(selection, data) {
    let fieldContent = '';
    const limit = (data.length <= 10) ? data.length : 10;
    for (let i = 0; i < limit; i++) {
        if (fieldContent.length > 896) break;
        fieldContent += `${i}) ${data[i].title} `;
        fieldContent += `(${data[i].year}) `;
        fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${data[i].tvdbId}&tab=series)]\n`;
    }

    let seriesEmbed = new Discord.RichEmbed();
    seriesEmbed.setTitle('Sonarr Series Search')
    .setDescription(`Please select one of the search results. ${(selection === 'emoji') ? '**Wait for the reactions to finish!**' : 'To abort answer **cancel**'}`)
    .addField('__Search Results__', fieldContent);

    return seriesEmbed;
}

const buildRadarrMovieEmbed = function(msg, movie) {
    let movieEmbed = new Discord.RichEmbed()
    .setTitle(`${movie.title} (${movie.year})`)
    .setDescription(movie.overview.substr(0, 250) + '(...)')
    .setFooter(msg.author.username, `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
    .setTimestamp(new Date())
    .setURL('https://www.themoviedb.org/movie/' + movie.tmdbId)
    .attachFile(path.join(__dirname, '..', '..', 'resources', 'tmdb.png'))
    .setThumbnail('attachment://tmdb.png')
    .addField('__Status__', movie.status, true)
    .addField('__Studio__', movie.studio, true)
    .addField('__Runtime__', `${movie.runtime}min`, true);

    if (movie.doesExist) movieEmbed.addField('__Added__', '✅', true);

    if (movie.remotePoster) movieEmbed.setImage(movie.remotePoster);
    else if (movie.images && movie.images[0].coverType === 'poster') movieEmbed.setImage(movie.images[0].url);

    return movieEmbed;
}

const buildRadarrMovieResults = function(selection, data) {
    let fieldContent = '';
    const limit = (data.length <= 10) ? data.length : 10;
    for (let i = 0; i < limit; i++) {
        if (fieldContent.length > 896) break;
        fieldContent += `${i}) ${data[i].title} `;
        fieldContent += `(${data[i].year}) `;
        fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${data[i].tmdbId})]\n`;
    }

    let movieEmbed = new Discord.RichEmbed();
    movieEmbed.setTitle('Radarr Movie Search')
    .setDescription(`Please select one of the search results. ${(selection === 'emoji') ? '**Wait for the reactions to finish!**' : 'To abort answer **cancel**'}`)
    .addField('__Search Results__', fieldContent);

    return movieEmbed;
}

module.exports = {
    buildHelpAllMsg,
    buildHelpCommandMsg,

    buildTautulliEmbed,

    buildOmbiMovieEmbed,
    buildOmbiSeriesEmbed,
    buildOmbiMovieResults,
    buildOmbiSeriesResults,

    buildSonarrSeriesEmbed,
    buildSonarrSeriesResults,

    buildRadarrMovieEmbed,
    buildRadarrMovieResults
}
