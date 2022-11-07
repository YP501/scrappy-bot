const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = (client, guildId) => {
    console.log('Uploading commands to guild...');
    try {
        const cmds = [];
        client.commands.forEach((cmd) => cmds.push(cmd.info.toJSON()));

        const rest = new REST({ version: '10' }).setToken(process.env.tokenDev);
        rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
            body: cmds,
        }).then(console.log('Done\n'));
    } catch (err) {
        console.error(err);
    }
};
