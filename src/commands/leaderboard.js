// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import { DiscordRankup } from "discord-rankup";
import { error } from "../structures/embeds.js";

const name = "leaderboard";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("List out all members based on their XP in chunks of 10")
  .addIntegerOption((option) => option.setName("page").setDescription("The page to list, defaults to 1 if invalid"));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Getting values
  let page = interaction.options.getInteger("page");
  if (page === null || page <= 0) {
    page = 1;
  }
  const skipAmount = (page - 1) * 10;

  const leaderboardXPMembers = await DiscordRankup.fetchLeaderboard(interaction.guild.id, { limit: 10, skip: skipAmount });
  if (leaderboardXPMembers.length === 0) {
    return interaction.editReply({ embeds: [error(`No entries found for page \`${page}\`, try a lower number`)] });
  }

  // Creating the embed "value" strings by using mapping magic
  const memberField = leaderboardXPMembers.map((XPMember, idx) => `${skipAmount + idx + 1} - <@${XPMember.UserID}>\n`).join("");
  const levelField = leaderboardXPMembers.map((XPMember) => `${XPMember.Level}\n`).join("");
  const xpField = leaderboardXPMembers.map((XPMember) => `${XPMember.XP}\n`).join("");

  // Slapping together the final embed
  const embed = new EmbedBuilder()
    .setTitle(`${interaction.guild.name} Level Leaderboard`)
    .setDescription(`Showing Top ${skipAmount + 1} - ${skipAmount + 10} Members | Page ${page}`)
    .setThumbnail("https://static-00.iconduck.com/assets.00/trophy-emoji-2048x2045-cd051k82.png")
    .setFields({ name: "Member", value: memberField, inline: true }, { name: "Level", value: levelField, inline: true }, { name: "XP", value: xpField, inline: true })
    .setColor("Purple")
    .setFooter({ text: `User ID: ${interaction.user.id}` });
  interaction.editReply({ embeds: [embed] });
}

export { name, data, execute };
