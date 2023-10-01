// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction } from "discord.js";

const name = "test";
const data = new SlashCommandBuilder().setName(name).setDescription("Small lil' test command to check if stuff is running");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  interaction.reply({ content: "test success 😎", ephemeral: true });
}

export { name, data, execute };
