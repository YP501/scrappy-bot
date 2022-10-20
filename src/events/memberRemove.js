const { channels } = require('../config.json');
const { clientEvents: eventEmbeds } = require('../util/builders/embeds');

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    execute: (member) => {
        member.guild.channels.cache.get(channels.clientEvents.guildMember.log).send({ embeds: [eventEmbeds.guildMemberRemoveLog(member)] });
        member.guild.channels.cache.get(channels.clientEvents.guildMember.welcome).send(`**${member.user.tag}** got griddied on 💀`);
    },
};
