// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { CronJob } from "cron";
import ms from "ms";
import { v4 as uuidv4 } from "uuid";
import { Infraction, Ban } from "../structures/schemas.js";
import { error, success, warning } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "ban";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Ban a user from the server")
  .addUserOption((option) => option.setName("target").setDescription("The user you are banning").setRequired(true))
  .addStringOption((option) =>
    option
      .setName("length")
      .setDescription("The length of this ban")
      .addChoices(
        { name: "1 day", value: "1d" },
        { name: "3 days", value: "3d" },
        { name: "1 week", value: "1w" },
        { name: "2 weeks", value: "2w" },
        { name: "1 month", value: "4w" },
        { name: "Permanent", value: "perm" }
      )
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option.setName("delete_messages").setDescription("Whether the messages the user sent in the last 7 days should be deleted or no").setRequired(true)
  )
  .addStringOption((option) => option.setName("reason").setDescription("The reason you are banning the user"));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Getting option variables
  const targetMember = interaction.options.getMember("target");
  const reason = interaction.options.getString("reason") || "No reason provided";
  const deleteMessageSeconds = interaction.options.getBoolean("delete_messages") ? 604800 : 0;
  const length = ms(interaction.options.getString("length"));
  const unbanTimestamp = length ? Date.now() + length : null;

  // Variable checks
  if (!targetMember.bannable) {
    return interaction.editReply({ embeds: [error("I don't have permission to ban that user")] });
  }
  if (reason.length > settings.maxReasonLength) {
    return interaction.editReply({ embeds: [error(`Keep your reason under ${settings.maxReasonLength} characters`)] });
  }

  // Initializing infractionData early for DM
  const infractionData = {
    type: "ban",
    targetUser_id: targetMember.user.id,
    moderatorUser_id: interaction.user.id,
    reason: reason,
    date: Math.floor(Date.now() / 1000),
    id: uuidv4(),
  };
  await new Infraction(infractionData).save();
  await new Ban({ targetUser_id: targetMember.user.id, unbanTimestamp: unbanTimestamp }).save();

  // Sending banned user a DM before ban because you cant send banned users messages
  const appealButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Appeal").setURL(settings.appealServerInvite).setStyle(ButtonStyle.Link));
  const formattedTimeLength = length ? ms(length, { long: true }) : "Permanent";
  const ban_dm = new EmbedBuilder()
    .setTitle("Ban information")
    .setDescription(infractionData.reason)
    .addFields(
      { name: "Moderator", value: `<@${infractionData.moderatorUser_id}>`, inline: true },
      { name: "Date", value: `<t:${infractionData.date}:f>`, inline: true },
      { name: "Length", value: `\`${formattedTimeLength}\`` },
      { name: "Infraction ID", value: `\`${infractionData.id}\`` }
    )
    .setColor("Red");

  try {
    await targetMember.user.send({
      content: `You have been banned from ${targetMember.guild.name}`,
      embeds: [ban_dm],
      components: [appealButton],
    });
  } catch (err) {
    interaction.followUp({ embeds: [warning("Unable to DM user, they have still been banned")], ephemeral: true });
  }

  // Executing ban
  try {
    await targetMember.ban({ reason: `[SCRAPPY] ${reason}`, deleteMessageSeconds: deleteMessageSeconds });
  } catch (_) {
    return interaction.editReply({ embeds: [error("Unable to ban that user. Are they already banned?")] });
  }
  interaction.editReply({ embeds: [success(`<@${targetMember.user.id}> has been banned: *${reason}*`)] });

  // Logging
  const logChannel = interaction.guild.channels.cache.get(settings.channels.logging.ban);
  const ban_log = new EmbedBuilder()
    .setTitle("New ban")
    .setDescription(reason)
    .addFields(
      { name: "User", value: `<@${infractionData.targetUser_id}>`, inline: true },
      { name: "Moderator", value: `<@${infractionData.moderatorUser_id}>`, inline: true },
      { name: "\u200b", value: "\u200b", inline: true },
      { name: "Length", value: `\`${formattedTimeLength}\`` },
      { name: "Date", value: `<t:${infractionData.date}:f>`, inline: true },
      { name: "Infraction ID", value: `\`${infractionData.id}\`` }
    )
    .setColor("Purple");
  logChannel.send({ embeds: [ban_log] });

  // Auto unban if permanent is not selected as length
  if (unbanTimestamp) {
    new CronJob(
      new Date(unbanTimestamp),
      async () => {
        interaction.guild.bans.remove(targetMember).catch(() => {});
        logChannel.send({ embeds: [success(`<@${targetMember.user.id}> has been automatically unbanned`)] });
        await Ban.deleteOne({ targetUser_id: targetMember.user.id });
      },
      null,
      true
    );
  }
}

export { name, data, execute };
