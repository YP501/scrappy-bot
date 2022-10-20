const { channels } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');

module.exports = {
    name: 'guildBanAdd',
    once: false,
    execute: (guildBan) => {
        guildBan.guild.channels.cache.get(channels.clientEvents.guildBan).send({ embeds: [eventEmbeds.guildBanAdd(guildBan)] });
    },
};
