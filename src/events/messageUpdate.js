const { channels } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');
const { message: msgEmbeds } = eventEmbeds;

module.exports = {
    name: 'messageUpdate',
    once: false,
    execute: (oldMsg, newMsg) => {
        const { client, author } = newMsg;
        if (author.id === client.user.id) return;
        client.channels.cache.get(channels.clientEvents.message).send({ embeds: [msgEmbeds.edit(oldMsg, newMsg)] });
    },
};
