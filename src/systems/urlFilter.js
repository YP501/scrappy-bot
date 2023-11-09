// eslint-disable-next-line no-unused-vars
import { EmbedBuilder, codeBlock, ButtonBuilder, ActionRowBuilder, Message } from "discord.js";
import { formatUrlMatch, getHostnameFromUrl } from "../functions/misc.js";
import { settings } from "../config.js";

/**
 * Perform a URL check on the provided message and delete the message if an un-whitelisted URL is detected
 * @param {Message} msg
 */
export async function filterUrl(msg) {
  if (msg.author.bot) return;
  if (msg.member.roles.cache.has(settings.roles.systems.filterBypass)) return;

  const regex = /(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-&?=%.]+/;
  const regexResult = regex.exec(msg.content);

  // If URL is detected
  if (regexResult) {
    // Check if detected domain is whitelisted
    const url = getHostnameFromUrl(regexResult[0]);
    if (url.includes("...")) return; // Prevents ... from being tagged; bro...
    const isWhitelisted = msg.client.whitelistedUrls.has(url);
    if (isWhitelisted) return;

    // Execute deletion and notifying user
    await msg.delete();

    // Build embed and buttons for sending
    const embed = new EmbedBuilder()
      .setTitle("URL Match Found")
      .setDescription(codeBlock(regexResult.input))
      .addFields({ name: "Matched URL", value: codeBlock("css", formatUrlMatch(regexResult, 10)) })
      .setFooter({ text: "Click the button below if you believe this is a false positive" })
      .setColor("Red");

    const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("urlmistake").setLabel("Mistake").setStyle("Danger"));

    try {
      await msg.member.send({ embeds: [embed], components: [button] });
    } catch (_) {
      const replyMsg = await msg.channel.send(`<@${msg.author.id}> that URL is not whitelisted`);
      setTimeout(() => {
        replyMsg.delete();
      }, 3000);
    }
  }
}
