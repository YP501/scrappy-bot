const { channels, roles } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');
const { guildMemberAdd: guildMemberAddEmbeds } = eventEmbeds;

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute: (member) => {
        member.guild.channels.cache.get(channels.clientEvents.guildMember.log).send({ embeds: [guildMemberAddEmbeds.log(member)] });
        member.guild.channels.cache.get(channels.clientEvents.guildMember.sendChannel).send({ embeds: [guildMemberAddEmbeds.sendChannel(member)] });
        roles.welcome.forEach((roleId) => member.roles.add(roleId));
    },
};
