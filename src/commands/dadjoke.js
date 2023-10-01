// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import axios from "axios";

const name = "dadjoke";
const data = new SlashCommandBuilder().setName(name).setDescription("Responds with a random dad joke from 'https://icanhazdadjoke.com/'");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  const res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } });
  if (res?.status !== 200) return interaction.editReply("Error: invalid response from the server");

  interaction.editReply(res.data.joke);
}

export { name, data, execute };
