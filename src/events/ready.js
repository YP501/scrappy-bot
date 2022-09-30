const config = require('../config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.user.setActivity(`on ${config.version}`);
        console.log(`Succesfully logged in as ${client.user.tag} on ${client.guilds.cache.size} servers\n`);

        // Calling this to set set slash commands to the guild
        require('../util/cmdSetter')(client, config);
        
    }
};