const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = (client, config) => {
    try {
        console.log('Started refreshing application (/) commands...');
        const rest = new REST({ version: '10' }).setToken(process.env.tokenDev);
        rest.put(Routes.applicationGuildCommands(client.user.id, config.guildId), {
            body: require('../structures/handlers/commands').cmds
        }).then(console.log('Successfully reloaded application (/) commands!\n'));
    } catch (err) {
        if (err) console.error(err);
    };
};