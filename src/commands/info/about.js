const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../util/static/embeds').info;

const info = new SlashCommandBuilder()
    .setName('about')
    .setDescription('Responds with some information about the bot and the server');

const execute = (inter) => {
    const { client } = inter;
    inter.reply({ embeds: [embeds.about(client)] });
};

module.exports = {
    info,
    execute
};