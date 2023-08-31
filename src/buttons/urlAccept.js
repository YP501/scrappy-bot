// eslint-disable-next-line no-unused-vars
import { ButtonInteraction, EmbedBuilder } from "discord.js";

/**
 * @param {ButtonInteraction} interaction
 */
const id = "mistakeReview_accept";
async function execute(interaction) {
  const embed = interaction.message.embeds[0];
  delete embed.data.title;

  // Preparing embeds
  const footerUser_id = embed.data.footer.text.slice(9);
  const footerUser = await interaction.client.users.fetch(footerUser_id);
  const embed_edited = EmbedBuilder.from(embed)
    .setAuthor({ name: `Approved by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    .setColor("Green");
  const embed_dm = EmbedBuilder.from(embed).setAuthor({ name: footerUser.tag, iconURL: footerUser.displayAvatarURL() }).setTitle("Filter report").setColor("Green");

  // Sending
  await footerUser.send({ content: "Your filter mistake report was accepted and the URL has been whitelisted", embeds: [embed_dm] });
  await interaction.update({ components: [], embeds: [embed_edited] });
  interaction.followUp({ content: "Please DM <@513709333494628355> with the matched URL so he can add it to the whitelist!", ephemeral: true });
}

export { id, execute };
