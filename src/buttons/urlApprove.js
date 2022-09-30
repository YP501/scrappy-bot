const embeds = require('../util/builders/embeds').util;

module.exports = {
    id: 'filterreviewapproved',
    execute(inter) {
        const { message, guild, user } = inter;
        const reportEmbed = message.embeds[0];
        const userId = reportEmbed.footer.text.slice(9);
        const member = guild.members.cache.get(userId);

        inter.update({ components: [], embeds: [embeds.reportEditApproved(reportEmbed, user)] })
            .then(_ => member.send({ content: 'Your filter mistake report was accepted and corrected.', embeds: [embeds.reportApproved(reportEmbed, member.user)] }));
    }
}