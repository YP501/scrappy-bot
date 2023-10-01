// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import axios from "axios";

const name = "insult";
const data = new SlashCommandBuilder().setName(name).setDescription("Get a fresh insult from 'https://evilinsult.com/'");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  const res = await axios.get("https://evilinsult.com/generate_insult.php?lang=en&type=json");
  if (res?.status !== 200) return interaction.editReply("Error: invalid response from the server");

  interaction.editReply(res.data.insult);
}

export { name, data, execute };
