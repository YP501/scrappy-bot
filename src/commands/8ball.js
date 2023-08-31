// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import axios from "axios";

const name = "8ball";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Ask the all knowing magic 8ball a question")
  .addStringOption((option) => option.setName("question").setDescription("The question you want to ask the 8ball").setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();
  const question = interaction.options.getString("question");

  // Making the api request so we don't have to write like 100 replies lol
  const res = await axios.get(`https://eightballapi.com/api/?question=${question}`);
  const embed = new EmbedBuilder()
    .setTitle("The magic 8ball")
    .setDescription(`❓ Question: ${question}\n✅ Answer: ${res.data.reading}`)
    .setColor("Purple")
    .setFooter({ text: `User ID: ${interaction.user.id}` });

  interaction.editReply({ embeds: [embed] });
}

export { name, data, execute };
