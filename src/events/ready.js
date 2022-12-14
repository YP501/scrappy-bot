const { guildId } = require('../config.json');

module.exports = {
    name: 'ready',
    once: true,
    execute: (client) => {
        console.log(`Succesfully logged in as ${client.user.tag} on ${client.guilds.cache.size} servers\n`);
        client.guilds.cache.get(guildId).members.fetch();

        // Calling this to set slash commands to the guild
        require('../util/cmdSetter')(client, guildId);
    },
};
