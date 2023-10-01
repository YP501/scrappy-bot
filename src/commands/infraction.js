// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import { pagination, ButtonTypes, ButtonStyles } from "@devraelfreeze/discordjs-pagination";
import { chunkifyArray } from "../functions/misc.js";
import { error, success } from "../structures/embeds.js";
import { Infraction } from "../structures/schemas.js";
import { settings } from "../config.js";

// TODO: Add ban and kick filter to get

const name = "infraction";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Interact with the infractions on the database")
  .addSubcommand((cmd) =>
    cmd
      .setName("get")
      .setDescription("Get a list of infractions from the database for a user")
      .addUserOption((option) => option.setName("user").setDescription("The user you want to get the infractions for").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of infractions you want to get")
          .addChoices(
            { name: "All", value: "all" },
            { name: "Timeout", value: "timeout" },
            { name: "Warning", value: "warning" },
            { name: "Blacklist", value: "blacklist" }
          )
          .setRequired(true)
      )
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("fetch")
      .setDescription("Fetch a single infraction instance from the database with full info")
      .addStringOption((option) => option.setName("infraction_id").setDescription("The ID of the infraction you want to fetch").setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("remove")
      .setDescription("Remove a single infraction from the database")
      .addStringOption((option) => option.setName("infraction_id").setDescription("The ID of the infraction you want to remove").setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("clear")
      .setDescription("Remove multiple infractions from the database for a user")
      .addUserOption((option) => option.setName("user").setDescription("The user you want to clear infractions for").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of infractions you want to remove")
          .addChoices(
            { name: "All", value: "all" },
            { name: "Timeout", value: "timeout" },
            { name: "Warning", value: "warning" },
            { name: "Blacklist", value: "blacklist" }
          )
          .setRequired(true)
      )
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("edit")
      .setDescription("Edit the reason of an infraction on the database")
      .addStringOption((option) => option.setName("infraction_id").setDescription("The ID of the infraction you want to edit the reason for").setRequired(true))
      .addStringOption((option) => option.setName("new_reason").setDescription("The new reason for the infraction").setRequired(true))
  );

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Permission check
  const roleID = settings.roles.permissions.infraction;
  if (!interaction.member.roles.cache.has(roleID)) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${roleID}> role or higher can use that!`)] });
  }

  switch (interaction.options.getSubcommand()) {
    case "get": {
      // Initialize case variables
      const user = interaction.options.getUser("user");
      const type = interaction.options.getString("type");

      // Query the database for infractions for the user
      let infractionQueryResult = null;
      if (type === "all") {
        infractionQueryResult = await Infraction.find({ targetUser_id: user.id });
      } else {
        infractionQueryResult = await Infraction.find({ targetUser_id: user.id, type: type });
      }

      // Check if query has any results
      if (infractionQueryResult.length === 0) {
        return interaction.editReply({ embeds: [error(`No infractions of type \`${type}\` found for user`)] });
      }

      // Prepare embed pages for sending
      const queryChunks = chunkifyArray(infractionQueryResult, 3);
      const embedList = [];
      let entryNum = 0;
      queryChunks.forEach((chunk) => {
        const embed = new EmbedBuilder()
          .setTitle(`Showing infractions for ${user.tag}`)
          .setThumbnail(user.displayAvatarURL())
          .setDescription("To get all information for an infraction, use `/infraction fetch`")
          .setColor("Purple");
        chunk.forEach((entry) => {
          entryNum++;
          embed.addFields({
            name: `Entry ${entryNum}`,
            value: `
            ${entry.reason}
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
      break;
    }
    case "fetch": {
      // Initialize case variables
      const infraction_id = interaction.options.getString("infraction_id");

      // Query the database for infraction using the ID
      const queryResult = await Infraction.findOne({ id: infraction_id });

      // Check if query has any results
      if (!queryResult) {
        return interaction.editReply({ embeds: [error(`No infraction found with ID \`${infraction_id}\``)] });
      }

      // Preparing embed for sending
      const embed = new EmbedBuilder()
        .setTitle("Infraction fetch result")
        .setDescription(queryResult.reason)
        .addFields(
          { name: "User", value: `<@${queryResult.targetUser_id}>`, inline: true },
          { name: "Moderator", value: `<@${queryResult.moderatorUser_id}>`, inline: true },
          { name: "Date", value: `<t:${queryResult.date}:f>`, inline: true },
          { name: "Type", value: `\`${queryResult.type}\``, inline: true },
          { name: "ID", value: `\`${queryResult.id}\``, inline: true }
        )
        .setColor("Purple")
        .setFooter({ text: `User ID: ${interaction.user.id}` });

      // Sending
      interaction.editReply({ embeds: [embed] });
      break;
    }
    case "remove": {
      // Initialize case variables
      const infraction_id = interaction.options.getString("infraction_id");

      // Query the database for infraction using the ID
      const { deletedCount } = await Infraction.deleteOne({ id: infraction_id });

      // Check if query has any results
      if (deletedCount === 0) {
        return interaction.editReply({ embeds: [error(`No infraction found with ID \`${infraction_id}\``)] });
      }

      // Sending
      interaction.editReply({ embeds: [success(`Removed infraction with ID \`${infraction_id}\``)] });
      break;
    }
    case "clear": {
      // Initialize case variables
      const user = interaction.options.getUser("user");
      const type = interaction.options.getString("type");

      // Query the database for infraction using the ID
      let deletedCount = 0;
      if (type === "all") {
        deletedCount = (await Infraction.deleteMany({ targetUser_id: user.id })).deletedCount;
      } else {
        deletedCount = (await Infraction.deleteMany({ targetUser_id: user.id, type: type })).deletedCount;
      }

      // Check if query has any results
      if (deletedCount === 0) {
        return interaction.editReply({ embeds: [error(`No infractions found with type \`${type}\` for <@${user.id}>`)] });
      }

      // Sending
      interaction.editReply({ embeds: [success(`Removed \`${deletedCount}\` infractions with type filter \`${type}\` for <@${user.id}>`)] });
      break;
    }
    case "edit": {
      // Initialize case variables
      const infraction_id = interaction.options.getString("infraction_id");
      const newReason = interaction.options.getString("new_reason");

      // Checks
      if (newReason.length > settings.maxReasonLength) {
        return interaction.editReply({ embeds: [error(`Keep your new reason under ${settings.maxReasonLength} characters`)] });
      }

      // Query the database for infraction using the ID and trying to update the reason with the newReason
      const { matchedCount } = await Infraction.updateOne({ id: infraction_id }, { reason: newReason });

      // Check if query has any results
      if (matchedCount === 0) {
        return interaction.editReply({ embeds: [error(`No infraction found to edit with ID \`${infraction_id}\``)] });
      }

      // Sending
      interaction.editReply({ embeds: [success(`New reason set for infraction with ID \`${infraction_id}\``)] });
      break;
    }
  }
}

export { name, data, execute };
