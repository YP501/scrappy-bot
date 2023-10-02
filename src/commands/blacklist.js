// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Infraction, Blacklist } from "../structures/schemas.js";
import { infraction_log, infraction_dm, success, error, warning } from "../structures/embeds.js";
import { v4 as uuidv4 } from "uuid";
import { settings } from "../config.js";

const name = "blacklist";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Blacklist a user from using scrappy's commands")
  .addSubcommand((cmd) =>
    cmd
      .setName("add")
      .setDescription("Add a user to the blacklist")
      .addUserOption((option) => option.setName("target").setDescription("The user to add to the blacklist").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("The reason you are blacklisting the user").setMaxLength(settings.maxReasonLength))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("remove")
      .setDescription("Remove a user from the blacklist")
      .addUserOption((option) => option.setName("target").setDescription("The user to remove from the blacklist").setRequired(true))
  )
  .addSubcommand((cmd) => cmd.setName("refresh").setDescription("Re-sync the local blacklist with the database if it happens de-sync"));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Permission check
  const roleID = settings.roles.permissions.blacklist;
  if (!interaction.member.roles.cache.has(roleID)) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${roleID}> role or higher can use that!`)] });
  }

  switch (interaction.options.getSubcommand()) {
    case "add": {
      // Settings case variables
      const targetUser = interaction.options.getUser("target");
      const reason = interaction.options.getString("reason") || "No reason provided";

      // Checking if user is already in blacklist
      const isBlacklisted = interaction.client.blacklist.has(targetUser.id);
      if (isBlacklisted) {
        return interaction.editReply({ embeds: [error("That user is already blacklisted")] });
      }

      // Setting database entry and local collection entry
      const infractionData = {
        type: "blacklist",
        targetUser_id: targetUser.id,
        moderatorUser_id: interaction.user.id,
        reason: reason,
        date: Math.floor(Date.now() / 1000),
        id: uuidv4(),
      };
      await new Infraction(infractionData).save();
      await new Blacklist({ targetUser_id: targetUser.id }).save();
      interaction.client.blacklist.add(targetUser.id);

      // Sending
      interaction.editReply({ embeds: [success("Added user to blacklist")] });

      // Logging blacklist
      const logChannel = interaction.guild.channels.cache.get(settings.channels.logging.blacklist);
      logChannel.send({ embeds: [infraction_log(infractionData)] });

      // Sending user a DM
      const appealButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Appeal").setURL(settings.appealServerInvite).setStyle(ButtonStyle.Link));
      try {
        await targetUser.send({
          content: "You have received a blacklist",
          embeds: [infraction_dm(infractionData)],
          components: [appealButton],
        });
      } catch (err) {
        interaction.followUp({ embeds: [warning("Unable to DM user, they have still received their warning")], ephemeral: true });
      }
      break;
    }
    case "remove": {
      // Setting case variables
      const targetUser = interaction.options.getUser("target");

      // Checking if user is blacklisted
      if (!interaction.client.blacklist.has(targetUser.id)) {
        return interaction.editReply({ embeds: [error("That user is not blacklisted")] });
      }

      // Updating local and DB blacklist
      const { deletedCount } = await Blacklist.deleteOne({ targetUser_id: targetUser.id });
      interaction.client.blacklist.delete(targetUser.id);

      // Sending
      await interaction.editReply({ embeds: [success("Removed user from blacklist")] });
      if (deletedCount === 0) {
        interaction.followUp({ embeds: [warning("No Database entry deleted. Please run `/blacklist refresh`")], ephemeral: true });
      }
      break;
    }
    case "refresh": {
      // Clearing local blacklist
      interaction.client.blacklist.clear();

      // Fetching blacklist from the database and setting it to the local one
      const queryResult = await Blacklist.find();
      queryResult.forEach((entry) => {
        interaction.client.blacklist.add(entry.targetUser_id);
      });

      // Sending
      interaction.editReply({ embeds: [success("Successfully refreshed local blacklist")] });
      break;
    }
  }
}

export { name, data, execute };
