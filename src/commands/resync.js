// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Blacklist, Whitelist } from "../structures/schemas.js";
import { success, error } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "resync";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Re-sync local lists if they happen to de-sync with the database")
  .addSubcommand((cmd) => cmd.setName("command_blacklist").setDescription("Re-sync the local command blacklist with the database"))
  .addSubcommand((cmd) => cmd.setName("url_whitelist").setDescription("Re-sync the local URL whitelist with the database"));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  const role = interaction.guild.roles.cache.get(settings.roles.permissions.resync);
  if (interaction.member.roles.highest.position < role.position) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${role.id}> role or higher can use that!`)] });
  }
  switch (interaction.options.getSubcommand()) {
    case "command_blacklist": {
      // Clearing local blacklist
      interaction.client.blacklist.clear();

      // Fetching blacklist from the database and setting it to the local one
      const queryResult = await Blacklist.find();
      queryResult.forEach((entry) => {
        interaction.client.blacklist.add(entry.targetUser_id);
      });

      // Sending
      interaction.editReply({ embeds: [success("Successfully re-synced local blacklist collection")] });
      break;
    }
    case "url_whitelist": {
      // Clearing local whitelist
      interaction.client.whitelistedUrls.clear();

      // Fetching whitelist from the database and setting it to the local one
      const queryResult = await Whitelist.find();
      queryResult.forEach((entry) => {
        interaction.client.whitelistedUrls.add(entry.url);
      });

      // Sending
      interaction.editReply({ embeds: [success("Successfully re-synced local url whitelist collection ")] });
      break;
    }
  }
}

export { name, data, execute };
