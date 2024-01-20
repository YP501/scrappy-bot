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

  const leaderboardXPMembers = await DiscordRankup.fetchLeaderboard(interaction.guild.id, { limit: 10, skip: 0 });
  if (leaderboardXPMembers.length === 0) return interaction.editReply({ embeds: [warning("Something went wrong with getting the leaderboard. Please try again")] });

  const fetchedMembers = await interaction.guild.members.fetch({ user: leaderboardXPMembers.map((XPMember) => XPMember.UserID), withPresences: false });

  const leaderboardEntries = [];
  let rankNum = 1;

  for (const member of fetchedMembers) {
    const user = member[1].user;
    const avatar = user.displayAvatarURL({ extension: "png", forceStatic: true });
    const username = user.tag;
    const displayName = user.displayName;
    const level = leaderboardXPMembers[rankNum - 1].Level;
    const xp = leaderboardXPMembers[rankNum - 1].XP;
    const rank = rankNum;

    leaderboardEntries.push({ avatar, username, displayName, level, xp, rank });
    rankNum++;
  }

  Font.loadDefault();
  const leaderboard = new LeaderboardBuilder()
    .setHeader({
      title: interaction.guild.name,
      image: interaction.guild.iconURL(),
      subtitle: `${interaction.guild.memberCount} members`,
    })
    .setPlayers(leaderboardEntries);
  const leaderboardBuffer = await leaderboard.build({ format: "png" });

  interaction.editReply({ files: [new AttachmentBuilder(leaderboardBuffer, "leaderboard.png")] });
}

export { name, data, execute };
