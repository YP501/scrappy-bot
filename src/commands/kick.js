// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { v4 as uuidv4 } from "uuid";
import { Infraction } from "../structures/schemas.js";
import { error, success, infraction_dm, infraction_log } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "kick";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Kick a user from the server")
  .addUserOption((option) => option.setName("target").setDescription("The user you want to kick").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("The reason you are kicking this user").setMaxLength(settings.maxReasonLength));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Permission check
  const roleID = settings.roles.permissions.kick;
  if (!interaction.member.roles.cache.has(roleID)) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${roleID}> role or higher can use that!`)] });
  }

  // Getting option variables
  const targetMember = interaction.options.getMember("target");
  const reason = interaction.options.getString("reason") || "No reason provided";

  // Variable checks
  if (!targetMember.kickable) {
    return interaction.editReply({ embeds: [error("I don't have permission to kick that user")] });
  }

  // Initializing infractionData early for DM
  const infractionData = {
    type: "kick",
    targetUser_id: targetMember.user.id,
    moderatorUser_id: interaction.user.id,
    reason: reason,
    date: Math.floor(Date.now() / 1000),
    id: uuidv4(),
  };
  await new Infraction(infractionData).save();

  // Sending banned user a DM before ban because you cant send banned users messages
  const appealButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Appeal").setURL(settings.appealServerInvite).setStyle(ButtonStyle.Link));
  try {
    await targetMember.user.send({
      content: `You have been kicked from ${targetMember.guild.name}`,
      embeds: [infraction_dm(infractionData)],
      components: [appealButton],
    });
  } catch (_) {
    // Do nothing
  }

  // Executing ban
  try {
    await targetMember.kick({ reason: `[SCRAPPY] ${reason}` });
  } catch (_) {
    return interaction.editReply({ embeds: [error("Unable to kick that user. Are they already kicked?")] });
  }
  interaction.editReply({ embeds: [success(`<@${targetMember.user.id}> has been kicked: *${reason}*`)] });

  // Logging
  const logChannel = interaction.guild.channels.cache.get(settings.channels.logging.kick);
  logChannel.send({ embeds: [infraction_log(infractionData)] });
}

export { name, data, execute };
