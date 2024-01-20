// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import { Infraction } from "../structures/schemas.js";
import { error } from "../structures/embeds.js";
import { chunkifyArray } from "../functions/misc.js";
import { ButtonStyles, ButtonTypes, pagination } from "@devraelfreeze/discordjs-pagination";
import { settings } from "../config.js";

const name = "mod_actions";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Get all the moderation actions someone has executed")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Filter the type of moderation actions")
      .addChoices(
        { name: "All", value: "all" },
        { name: "Bans", value: "ban" },
        { name: "Blacklists", value: "blacklist" },
        { name: "Kicks", value: "kick" },
        { name: "Timeouts", value: "timeout" },
        { name: "Warnings", value: "warning" }
      )
      .setRequired(true)
  )
  .addUserOption((option) => option.setName("user").setDescription("The user to check which moderation actions they executed"));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Permission check
  const role = interaction.guild.roles.cache.get(settings.roles.permissions.infraction);
  if (interaction.member.roles.highest.position < role.position) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${role.id}> role or higher can use that!`)] });
  }

  // Initialize  variables
  const user = interaction.options.getUser("user") || interaction.user;
  const type = interaction.options.getString("type");

  // Query the database for infractions for the user
  let infractionQueryResult = null;
  if (type === "all") {
    infractionQueryResult = await Infraction.find({ moderatorUser_id: user.id });
  } else {
    infractionQueryResult = await Infraction.find({ moderatorUser_id: user.id, type: type });
  }

  // Check if query has any results
  if (infractionQueryResult.length === 0) {
    return interaction.editReply({ embeds: [error(`No moderation actions executed by user found of type \`${type}\``)] });
  }

  // Prepare embed pages for sending
  const queryChunks = chunkifyArray(infractionQueryResult, 3);
  const embedList = [];
  let entryNum = 0;
  queryChunks.forEach((chunk) => {
    const embed = new EmbedBuilder()
      .setTitle(`Showing moderation actions executed by ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .setDescription("To get all information for an infraction, use `/infraction fetch`")
      .setColor("Purple");
    chunk.forEach((entry) => {
      entryNum++;
      embed.addFields({
        name: `Entry ${entryNum}`,
        value: `
        >>> ${entry.reason}
        Type: \`${entry.type}\`
        ID: \`${entry.id}\`
      `,
        inline: false,
      });
    });
    embedList.push(embed);
  });

  // Sending
  pagination({
    embeds: embedList,
    author: interaction.user,
    interaction: interaction,
    ephemeral: false,
    time: 120000,
    disableButtons: true,
    pageTravel: false,
    fastSkip: true,
    buttons: [
      {
        type: ButtonTypes.previous,
        style: ButtonStyles.Primary,
      },
      {
        type: ButtonTypes.next,
        style: ButtonStyles.Primary,
      },
    ],
  });
}

export { name, data, execute };
