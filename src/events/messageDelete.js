const { channels } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');
const { message: msgEmbeds } = eventEmbeds;

module.exports = {
    name: 'messageDelete',
    once: false,
    execute: (msg) => {
        msg.client.channels.cache.get(channels.clientEvents.message).send({ embeds: [msgEmbeds.delete(msg)] });
    },
};
