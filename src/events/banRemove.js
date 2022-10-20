const { channels } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');

module.exports = {
    name: 'guildBanRemove',
    once: false,
    execute: (guildBan) => {
        guildBan.guild.channels.cache.get(channels.clientEvents.guildBan).send({ embeds: [eventEmbeds.guildBanRemove(guildBan)] });
    },
};
