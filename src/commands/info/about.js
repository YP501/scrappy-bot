const { SlashCommandBuilder } = require('discord.js');
const { info: infoEmbeds } = require('../../util/builders/embeds');

const info = new SlashCommandBuilder().setName('about').setDescription('Responds with some information about the bot');

const execute = (inter) => {
    const { client } = inter;
    inter.reply({ embeds: [infoEmbeds.about(client)] });
};

module.exports = {
    info,
    execute,
};
