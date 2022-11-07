const { readdirSync } = require('fs');

module.exports.execute = (client) => {
    console.log('Setting command collection...');
    const cmdFolders = readdirSync('./src/commands');
    for (const folder of cmdFolders) {
        const cmdFiles = readdirSync(`./src/commands/${folder}`).filter((file) => file.endsWith('js'));
        for (const file of cmdFiles) {
            const cmd = require(`../../commands/${folder}/${file}`);
            client.commands.set(cmd.info.name, cmd);
        }
    }
    console.log('Done\n');
};
