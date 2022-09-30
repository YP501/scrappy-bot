const { SlashCommandBuilder } = require('discord.js');

const info = new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Get a quick answer for any yes or no question')
    .addStringOption(option =>
        option
            .setName('question')
            .setDescription('The question you want answered')
            .setRequired(true));

function execute(inter) {
    const { user, options } = inter;
    const answers = [
        'yes',
        'maybe',
        'no',
        '🤨',
        'lmao no',
        'of course!',
        'yessir',
        '👍',
        '😰',
        'L + ratio + you fell off',
        'bruh idk lol',
        'imagine needing to ask that to a discord bot with no personallity, go touch some grass man.',
        'im gonna shank you right now'
    ];
    const rng = Math.floor(Math.random() * answers.length);
    inter.reply(`${user.username} asked: \`${options.getString('question')}\`\nTo which I say: \`${answers[rng]}\``);
};

module.exports = {
    info,
    execute
};