const { EmbedBuilder } = require('discord.js');

module.exports = {
    id: 'filterReview_accept',
    execute: async (inter) => {
        const { message, client, user: modUser } = inter;
        const messageEmbed = message.embeds[0];
        delete messageEmbed.data.title;

        const footerUserId = messageEmbed.data.footer.text.slice(9);
        const footerUser = await client.users.fetch(footerUserId, { cache: false });

        const approveEdit = EmbedBuilder.from(messageEmbed)
            .setAuthor({ name: `Approved by ${modUser.tag}`, iconURL: modUser.displayAvatarURL() })
            .setColor('Green');

        const approveDm = EmbedBuilder.from(messageEmbed)
            .setAuthor({ name: footerUser.tag, iconURL: footerUser.displayAvatarURL() })
            .setTitle('Filter report')
            .setColor('Green');

        await inter.update({ components: [], embeds: [approveEdit] });
        await inter.followUp({ content: 'Please DM <@513709333494628355> with the matched URL so he can add it to the whitelist!', ephemeral: true });
        footerUser.send({ content: 'Your filter mistake report was accepted and corrected.', embeds: [approveDm] });
    },
};
