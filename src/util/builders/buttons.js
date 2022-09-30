// TODO: add buttons to cmd folders where needed and possible
const { ButtonBuilder, ActionRowBuilder } = require('discord.js')

const misc = {
    foundBlacklistedUrl: {
        enabled() {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('urlmistake')
                        .setLabel('Mistake')
                        .setStyle('Danger')
                )
        },
        disabled() {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('urlmistake')
                        .setLabel('Mistake')
                        .setStyle('Danger')
                        .setDisabled(true)
                )
        }
    },
    filterReport() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('filterreviewapproved')
                    .setLabel('Accept')
                    .setStyle('Success'),
                new ButtonBuilder()
                    .setCustomId('filterreviewdeclined')
                    .setLabel('Decline')
                    .setStyle('Danger')
            )

    },
};

module.exports = {
    misc,
};