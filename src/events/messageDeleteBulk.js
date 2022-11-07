const { channels } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');
const { message: msgEmbeds } = eventEmbeds;

// TODO: test if this works with purge
module.exports = {
    name: 'messageDeleteBulk',
    once: false,
    execute: (msgs, channel) => {
        const { client } = channel;
        client.channels.cache.get(channels.clientEvents.message).send({ embeds: [msgEmbeds.bulkDelete(msgs.size, channel)] });
    },
};
