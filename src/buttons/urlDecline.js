// eslint-disable-next-line no-unused-vars
import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";

/**
 * @param {ButtonInteraction} interaction
 */
const id = "mistakeReview_decline";
async function execute(interaction) {
  const embed = interaction.message.embeds[0];
  delete embed.data.title;

  // Preparing embeds
  const footerUser_id = embed.data.footer.text.slice(9);
  const footerUser = await interaction.client.users.fetch(footerUser_id, { cache: false });
  const embed_edited = EmbedBuilder.from(embed)
    .setAuthor({ name: `Declined by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    .setColor("Red");
  const embed_dm = EmbedBuilder.from(embed).setAuthor({ name: footerUser.tag, iconURL: footerUser.displayAvatarURL() }).setTitle("Filter report").setColor("Red");

  const whitelistedButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setURL("https://pastebin.com/raw/sTeY0f7m").setLabel("Whitelisted Domains").setStyle("Link")
  );
  // Sending
  await footerUser.send({
    content: "Your filter mistake report was declined and the URL has not been whitelisted",
    embeds: [embed_dm],
    components: [whitelistedButton],
  });
  interaction.update({ components: [], embeds: [embed_edited] });
}

export { id, execute };
