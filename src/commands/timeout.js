// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import ms from "ms";
import { v4 as uuidv4 } from "uuid";
import { Infraction } from "../structures/schemas.js";
import { success, error, warning } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "timeout";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Timeout a user from the server")
  .addUserOption((option) => option.setName("target").setDescription("The user to time out").setRequired(true))
  .addStringOption((option) =>
    option
      .setName("length")
      .setDescription("How long the user should be timed out for")
      .addChoices(
        { name: "60 seconds", value: "60s" },
        { name: "5 minutes", value: "5min" },
        { name: "10 minutes", value: "10min" },
        { name: "1 hour", value: "1h" },
        { name: "1 day", value: "1d" },
        { name: "1 week", value: "1w" }
      )
      .setRequired(true)
  )
  .addStringOption((option) => option.setName("reason").setDescription("Why the user should be timed out"));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Permission check
  const roleID = settings.roles.permissions.timeout;
  if (!interaction.member.roles.cache.has(roleID)) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${roleID}> role or higher can use that!`)] });
  }

  const timeoutMember = interaction.options.getMember("target");
  const timeoutLength = ms(interaction.options.getString("length"));
  const timeoutReason = interaction.options.getString("reason") || "No reason provided";

  // Step 1: checks
  if (timeoutReason.length > settings.maxReasonLength) {
    return interaction.editReply({ embeds: [error(`Keep your reason under ${settings.maxReasonLength} characters`)] });
  }

  if (timeoutMember.isCommunicationDisabled()) {
    return interaction.editReply({ embeds: [error("User is already timed out")] });
  }

  // Step 2: Executing timeout
  try {
    await timeoutMember.timeout(timeoutLength, timeoutReason);
  } catch (_) {
    return interaction.editReply({ embeds: [error("I don't have the permission to time that user out")] });
  }
  interaction.editReply({ embeds: [success(`<@${timeoutMember.user.id}> has been timed out: *${timeoutReason}*`)] });

  const infractionData = {
    type: "timeout",
    targetUser_id: timeoutMember.user.id,
    moderatorUser_id: interaction.user.id,
    reason: timeoutReason,
    date: Math.floor(Date.now() / 1000),
    id: uuidv4(),
  };
  await new Infraction(infractionData).save();

  // Step 3: Logging timeout
  const logChannel = interaction.guild.channels.cache.get(settings.channels.logging.timeout);
  const formattedTimeoutLength = ms(timeoutLength, { long: true });
  const timeout_log = new EmbedBuilder()
    .setTitle("New timeout")
    .setDescription(timeoutReason)
    .addFields(
      { name: "User", value: `<@${infractionData.targetUser_id}>`, inline: true },
      { name: "Moderator", value: `<@${infractionData.moderatorUser_id}>`, inline: true },
      { name: "\u200b", value: "\u200b", inline: true },
      { name: "Length", value: `\`${formattedTimeoutLength}\`` },
      { name: "Date", value: `<t:${infractionData.date}:f>`, inline: true },
      { name: "Infraction ID", value: `\`${infractionData.id}\`` }
    )
    .setColor("Purple");
  logChannel.send({ embeds: [timeout_log] });

  // Step 4: Sending timed out user a DM
  const appealButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Appeal").setURL(settings.appealServerInvite).setStyle(ButtonStyle.Link));
  const timeout_dm = new EmbedBuilder()
    .setTitle("Timeout information")
    .setDescription(infractionData.reason)
    .addFields(
      { name: "Moderator", value: `<@${infractionData.moderatorUser_id}>`, inline: true },
      { name: "Date", value: `<t:${infractionData.date}:f>`, inline: true },
      { name: "Length", value: `\`${formattedTimeoutLength}\`` },
      { name: "Infraction ID", value: `\`${infractionData.id}\`` }
    )
    .setColor("Red");

  try {
    await timeoutMember.user.send({
      content: "You have received a timeout",
      embeds: [timeout_dm],
      components: [appealButton],
    });
  } catch (err) {
    interaction.followUp({ embeds: [warning("Unable to DM user, they have still received their timeout")], ephemeral: true });
  }
}

export { name, data, execute };
