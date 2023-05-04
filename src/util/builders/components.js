const { ButtonBuilder, ActionRowBuilder } = require('discord.js');

const misc = {
    foundBlacklistedUrl: () => new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('urlmistake').setLabel('Mistake').setStyle('Danger')),
    filterReport: () => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('filterReview_accept').setLabel('Accept').setStyle('Success'),
            new ButtonBuilder().setCustomId('filterReview_decline').setLabel('Decline').setStyle('Danger')
        );
    },
    whitelistedUrls: () => {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setURL('https://pastebin.com/raw/sTeY0f7m').setLabel('Whitelisted Domains').setStyle('Link'));
    },
};

module.exports = {
    misc,
};
