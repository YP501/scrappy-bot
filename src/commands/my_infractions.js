// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Infraction } from "../structures/schemas.js";
import { success } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "my_infractions";
const data = new SlashCommandBuilder().setName(name).setDescription("Get a list of all your active infractions");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const infractionQueryResult = await Infraction.find({ targetUser_id: interaction.user.id });

  // Check if query has any results
  if (infractionQueryResult.length === 0) {
    return interaction.editReply({ embeds: [success("You have no active infractions, keep it up!")] });
  }

  // Making big embed for sending
  const embed = new EmbedBuilder().setTitle("Showing your infractions").setThumbnail(interaction.user.displayAvatarURL()).setColor("Purple");
  infractionQueryResult.forEach((entry, idx) =>
    embed.addFields({
      name: `Entry ${idx + 1}`,
      value: `
    ${entry.reason}
    Type: \`${entry.type}\`
    ID: \`${entry.id}\`
  `,
      inline: false,
    })
  );

  interaction.editReply({ embeds: [success("Sent you a list with your active infractions in your DM's")] });

  // Sending
  const appealButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Appeal").setURL(settings.appealServerInvite).setStyle(ButtonStyle.Link));
  interaction.user.send({ embeds: [embed], components: [appealButton] });
}

export { name, data, execute };
