// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder } from "discord.js";
import { DiscordRankup } from "discord-rankup";
import Canvacord from "canvacord";
import { error } from "../structures/embeds.js";
import { readFileSync } from "node:fs";

const name = "rank";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("View your or another member's level and XP progress")
  .addUserOption((option) => option.setName("member").setDescription("The member you'd like to view").setRequired(false));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  const user = interaction.options.getUser("member") || interaction.user;
  const levelData = await DiscordRankup.fetch(user.id, interaction.guild.id);
  if (!levelData) {
    return interaction.editReply({ embeds: [error("No level entry found for that user!")] });
  }
  const levelRank = await DiscordRankup.getRank(user.id, interaction.guild.id);
  const rankCard = new Canvacord.Rank()
    .renderEmojis(true)
    .setAvatar(user.displayAvatarURL({ dynamic: false }))
    .setBackground("IMAGE", readFileSync("./src/assets/leverCard_default.png"))
    .setCurrentXP(levelData.XP)
    .setCustomStatusColor("#ffffff")
    .setLevel(levelData.Level)
    .setMinXP(DiscordRankup.requiredXP(levelData.Level))
    .setOverlay("#000000", 0.5, false)
    .setProgressBar(["#616AE5", "#5C0B6D"], "GRADIENT", false)
    .setProgressBarTrack("#FFFFFF")
    .setRank(levelRank)
    .setRequiredXP(DiscordRankup.requiredXP(levelData.Level + 1))
    .setUsername(user.tag);

  const rankCardBuffer = await rankCard.build();
  interaction.editReply({ files: [new AttachmentBuilder(rankCardBuffer, "rankCard.png")] });
}

export { name, data, execute };
