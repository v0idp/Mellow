exports.run = (client) => {
    console.log(`BotClient ready and logged in as ${client.user.tag} (${client.user.id}). Prefix set to ${client.config.commandprefix}. Use ${client.config.commandprefix}help to view the commands list!`);
    client.user.setActivity(`${client.config.commandprefix}help`, { type: 'LISTENING' });
}
