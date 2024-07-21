// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder } from "discord.js";
import { DiscordRankup } from "discord-rankup";
import { Font, RankCardBuilder } from "canvacord";
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
  const cardData = await DiscordRankup.getCardData(user.id, interaction.guild.id);
  if (!cardData) {
    return interaction.editReply({ embeds: [error("No level entry found for that user!")] });
  }

  Font.loadDefault();
  const levelRank = await DiscordRankup.getRank(user.id, interaction.guild.id);
  const rankCard = new RankCardBuilder()
    .setDisplayName(user.displayName)
    .setUsername(`@${user.tag}`)
    .setAvatar(user.displayAvatarURL({ forceStatic: true }))
    .setCurrentXP(cardData.currentXP)
    .setRequiredXP(DiscordRankup.requiredXP(cardData.level + 1))
    .setLevel(cardData.level)
    .setOverlay(0.5)
    .setRank(levelRank)
    .setProgressCalculator(() => {
      return Math.floor((DiscordRankup.requiredXP(cardData.level) / DiscordRankup.requiredXP(cardData.level + 1)) * 100);
    });

  const rankCardBuffer = await rankCard.build({ format: "png" });
  interaction.editReply({ files: [new AttachmentBuilder(rankCardBuffer, "rankCard.png")] });
}

export { name, data, execute };
