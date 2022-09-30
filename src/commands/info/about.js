const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../util/builders/embeds').info;

const info = new SlashCommandBuilder()
    .setName('about')
    .setDescription('Responds with some information about the bot and the server');

async function execute(inter) {
    const { client, guild } = inter;
    const memberCount = await guild.members.fetch().then(members => members.filter((member) => !member.user.bot).size)//filter((members) => !members.user.bot).size
    await inter.reply({ embeds: [embeds.about(client, memberCount)] });
};

module.exports = {
    info,
    execute
};