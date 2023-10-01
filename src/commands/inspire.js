// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder } from "discord.js";
import axios from "axios";

const name = "inspire";
const data = new SlashCommandBuilder().setName(name).setDescription("Get some inspirational quotes, freshly generated from 'https://inspirobot.me'");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  const res = await axios.get("https://inspirobot.me/api?generate=true");
  if (res?.status !== 200) return interaction.editReply("Error: invalid response from server");

  interaction.editReply({ files: [new AttachmentBuilder(res.data, "inspiration.jpg")] });
}

export { name, data, execute };
