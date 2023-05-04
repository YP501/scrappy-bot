const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = (client, guildId) => {
    console.log('Uploading commands to guild...');
    try {
        // Getting commands from client.commands collection and pushing to cmds array
        const cmds = [];
        client.commands.forEach((cmd) => cmds.push(cmd.info.toJSON()));

        // Adding cmds to the guild
        const rest = new REST({ version: '10' }).setToken(process.env.tokenDev);
        rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: cmds }).then(console.log('Done\n'));
    } catch (err) {
        console.error(err);
    }
};
