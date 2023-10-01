// eslint-disable-next-line no-unused-vars
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { Whitelist } from "../structures/schemas.js";
import { getHostnameFromUrl } from "../functions/misc.js";

/**
 * @param {ButtonInteraction} interaction
 */
const id = "mistakeReview_accept";
async function execute(interaction) {
  const embed = interaction.message.embeds[0];
  delete embed.data.title;

  // Preparing embeds
  const str = embed.data.fields[0].value;
  const hostname = getHostnameFromUrl(str.substring(str.indexOf("[") + 1, str.lastIndexOf("]")));

  const footerUser_id = embed.data.footer.text.slice(9);
  const footerUser = await interaction.client.users.fetch(footerUser_id);
  const embed_edited = EmbedBuilder.from(embed)
    .setAuthor({ name: `Approved by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
    .setColor("Green");
  const embed_dm = EmbedBuilder.from(embed).setAuthor({ name: footerUser.tag, iconURL: footerUser.displayAvatarURL() }).setTitle("Filter report").setColor("Green");

  // Updating whitelist on DB and locally
  await new Whitelist({ url: hostname }).save();
  interaction.client.whitelistedUrls.add(hostname);

  // Sending
  await footerUser.send({ content: "Your filter mistake report was accepted and the URL has been whitelisted", embeds: [embed_dm] });
  await interaction.update({ components: [], content: null, embeds: [embed_edited] });
}

export { id, execute };
