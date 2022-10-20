const { EmbedBuilder } = require('discord.js');
const { successEmbed } = require('../util/builders/embeds');
const { misc: miscButtons } = require('../util/builders/components');
const { channels } = require('../config.json');
const { disablifyButtons } = require('../util/functions');

module.exports = {
    id: 'urlmistake',
    execute: (inter) => {
        const { client, message, user } = inter;
        const reviewChannel = client.channels.cache.get(channels.filterReview);
        const reviewEmbed = EmbedBuilder.from(message.embeds[0])
            .setTitle('New filter mistake report:')
            .setFooter({ text: `User ID: ${user.id}` })
            .setColor('Purple');

        inter.update({ components: [disablifyButtons(inter.message.components[0])] }).then(() => {
            reviewChannel.send({ embeds: [reviewEmbed], components: [miscButtons.filterReport()] });
            inter.followUp({ embeds: [successEmbed('Report was sent for review!')], ephemeral: true });
        });
    },
};
