const { readdirSync} = require('fs');

module.exports.execute = (client) => {
    console.log('Setting button collection...');
    const buttonFiles = readdirSync('./src/buttons');
    buttonFiles.forEach(file => {
        const button = require(`../../buttons/${file}`);
        if(!button.id) return;
        client.buttons.set(button.id, button);
    });
    console.log('Done\n');
};