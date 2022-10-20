const { channels, roles } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute: (member) => {
        member.guild.channels.cache.get(channels.clientEvents.guildMember.log).send({ embeds: [eventEmbeds.guildMemberAddLog(member)] });
        member.guild.channels.cache.get(channels.clientEvents.guildMember.welcome).send({ embeds: [eventEmbeds.guildMemberAddWelcome(member)] });
        roles.welcome.forEach((roleId) => member.roles.add(roleId));
    },
};
