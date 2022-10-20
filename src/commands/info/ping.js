const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../util/builders/embeds').info;

const info = new SlashCommandBuilder().setName('ping').setDescription('Check bot and API latency');

const execute = (inter) => {
    inter.deferReply({ fetchReply: true }).then((resultInter) => {
        const ping = resultInter.createdTimestamp - inter.createdTimestamp;
        inter.editReply({ embeds: [embeds.ping(inter.client.ws.ping, ping)] });
    });
};

module.exports = {
    info,
    execute,
};
