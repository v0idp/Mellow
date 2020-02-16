exports.run = async (client, msg) => {
    if (msg.author.bot) return;
    if (msg.channel.type !== 'dm' && client.config.channelname !== "")
        if (msg.channel.name.toLowerCase() !== client.config.channelname.toLowerCase()) return;
    if (msg.channel.type !== 'dm' && !msg.content.trim().replace(/ /g, '').startsWith(client.config.commandprefix)) return;
    
    let args = msg.content.split(/ +/);
    if (msg.channel.type !== 'dm') args = msg.content.slice(client.config.commandprefix.length).split(/ +/);

    const command = args.shift().toLowerCase();

    if (!client.commands[command])
        if (client.config.unknowncommandresponse === 'true')
            return client.reply(msg, `Unknown command. Use ${client.config.commandprefix}help to view the commands list!`);
        else return;

    if (msg.channel.type !== 'text' && client.commands[command].guildOnly) return;
    if (!client.commands[command].hasPermission(msg.author)) return;
    
    client.commands[command].run(msg, args);
}
