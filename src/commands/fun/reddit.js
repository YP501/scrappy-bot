const { SlashCommandBuilder } = require('discord.js');
const { getPost } = require('random-reddit');
const { subReddits } = require('../../config.json');
const embeds = require('../../util/builders/embeds').fun;

const info = new SlashCommandBuilder()
    .setName('reddit')
    .setDescription('Get a random post from some funny subreddits')

const execute = async (inter) => {
    inter.deferReply();

    let post = await getPost(subReddits);
    while (!post.url.includes('jpg') && !post.url.includes('png')) {
        post = await getPost(subReddits);
    };

    inter.editReply({ embeds: [embeds.reddit(post)] });
};

module.exports = {
    info,
    execute
};