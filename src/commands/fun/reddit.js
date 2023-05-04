const { SlashCommandBuilder } = require('discord.js');
const { getPost } = require('random-reddit');
const { subReddits } = require('../../config.json');
const { fun: funEmbeds } = require('../../util/builders/embeds');

const info = new SlashCommandBuilder().setName('reddit').setDescription('Get a random post from some funny subreddits');

const execute = async (inter) => {
  await inter.deferReply();

  let post = await getPost(subReddits);
  while (!post.url.includes('jpg') && !post.url.includes('png')) {
    post = await getPost(subReddits);
  }

  await inter.editReply({ embeds: [funEmbeds.reddit(post)] });
};

module.exports = {
  info,
  execute,
};
