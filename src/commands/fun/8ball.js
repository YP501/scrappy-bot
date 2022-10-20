const { SlashCommandBuilder } = require('discord.js');
const { fun: funEmbeds } = require('../../util/builders/embeds');
const { eightBallAnswers } = require('../../config.json');

const info = new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Get a quick answer for any yes or no question')
    .addStringOption((option) => option.setName('question').setDescription('The question you want answered').setRequired(true));

const execute = (inter) => {
    const { user, options } = inter;
    const answer = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
    inter.reply({ embeds: [funEmbeds.eightBall(user, options.getString('question'), answer)] });
};

module.exports = {
    info,
    execute,
};
