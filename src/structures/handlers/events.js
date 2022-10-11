const { readdirSync } = require('fs');

module.exports.execute = (client) => {
    const eventFiles = readdirSync('./src/events');
    for (const file of eventFiles) {
        const event = require(`../../events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
};
