const { EmbedBuilder } = require('discord.js');
const { misc: miscButtons } = require('../util/builders/components');

module.exports = {
    id: 'filterReview_decline',
    execute: async (inter) => {
        const { message, client, user: modUser } = inter;
        const messageEmbed = message.embeds[0];
        delete messageEmbed.data.title;

        const footerUserId = messageEmbed.data.footer.text.slice(9);
        const footerUser = await client.users.fetch(footerUserId, { cache: false });

        const declineEdit = EmbedBuilder.from(messageEmbed)
            .setAuthor({ name: `Declined by ${modUser.tag}`, iconURL: modUser.displayAvatarURL() })
            .setColor('Red');

        const declineDm = EmbedBuilder.from(messageEmbed)
            .setAuthor({ name: footerUser.tag, iconURL: footerUser.displayAvatarURL() })
            .setTitle('Filter report')
            .setColor('Red');

        await inter.update({ components: [], embeds: [declineEdit] });
        await footerUser.send({
            content:
                '**Your filter mistake report was declined.**\n\nThis means the filter correctly filtered out a malicious URL from your message and it will not be whitelisted.',
            embeds: [declineDm],
            components: [miscButtons.whitelistedUrls()],
        });
    },
};
