const embeds = require('../util/builders/embeds').util;

module.exports = {
    id: 'filterreviewdeclined',
    execute(inter) {
        const { message, guild, user } = inter;
        const reportEmbed = message.embeds[0];
        const userId = reportEmbed.footer.text.slice(9);
        const member = guild.members.cache.get(userId);

        inter.update({ components: [], embeds: [embeds.reportEditDeclined(reportEmbed, user)] })
            .then(_ => member.send({
                content: "**Your filter mistake report was declined.**\n\nthis means the filter correctly filtered out your URL and it won't be whitelisted.\nList of whitelisted domains: https://pastebin.com/raw/sTeY0f7m",
                embeds: [embeds.reportDeclined(reportEmbed, member.user)]
            }));
    }
}