// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder } from "discord.js";
import { DiscordRankup } from "discord-rankup";
import { warning } from "../structures/embeds.js";
import { Font, LeaderboardBuilder } from "canvacord";

const name = "leaderboard";
const data = new SlashCommandBuilder().setName(name).setDescription("List the top 10 members with the highest level and XP");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  const leaderboardXPMembers = await DiscordRankup.fetchLeaderboard(interaction.guild.id, { limit: 3, skip: 0 });
  if (leaderboardXPMembers.length === 0) return interaction.editReply({ embeds: [warning("Something went wrong with getting the leaderboard. Please try again")] });

  const leaderboardEntries = [];

  for (let i = 0; i < leaderboardXPMembers.length; i++) {
    const user = await interaction.client.users.fetch(leaderboardXPMembers[i].UserID);
    const avatar = user.displayAvatarURL({ forceStatic: true });
    const username = user.tag;
    const displayName = user.displayName;
    const level = leaderboardXPMembers[i].Level;
    const xp = leaderboardXPMembers[i].XP;
    const rank = i + 1;

    leaderboardEntries.push({ avatar, username, displayName, level, xp, rank });
  }

  Font.loadDefault();
  const leaderboard = new LeaderboardBuilder()
    .setHeader({
      title: interaction.guild.name,
      image: interaction.guild.iconURL(),
      subtitle: `${interaction.guild.memberCount} members`,
    })
    .setPlayers(leaderboardEntries);
  const leaderboardBuffer = await leaderboard.build();

  interaction.editReply({ files: [new AttachmentBuilder(leaderboardBuffer, "leaderboard.png")] });
}

export { name, data, execute };
