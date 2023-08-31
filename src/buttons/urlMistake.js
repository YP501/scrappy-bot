// eslint-disable-next-line no-unused-vars
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { disableButtons } from "../functions/components.js";
import { settings } from "../config.js";
import { success } from "../structures/embeds.js";

/**
 * @param {ButtonInteraction} interaction
 */
const id = "urlmistake";
async function execute(interaction) {
  // Building embed and preparing logging channel
  const reviewChannel = interaction.client.channels.cache.get(settings.channels.logging.filter_review);
  const embed = EmbedBuilder.from(interaction.message.embeds[0])
    .setTitle("New filter mistake report")
    .setFooter({ text: `User ID: ${interaction.user.id}` });

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("mistakeReview_accept").setLabel("Accept").setStyle("Success"),
    new ButtonBuilder().setCustomId("mistakeReview_decline").setLabel("Decline").setStyle("Danger")
  );

  // Sending
  await reviewChannel.send({ embeds: [embed], components: [buttonRow] });
  await interaction.update({ components: [disableButtons(interaction.message.components[0])] });
  interaction.followUp({ embeds: [success("Report was sent for review")], ephemeral: true });
}

export { id, execute };
