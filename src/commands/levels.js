// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { DiscordRankup } from "discord-rankup";
import { success, error } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "levels";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Interact with the level system database")
  .addSubcommand((cmd) =>
    cmd
      .setName("add_xp")
      .setDescription("Adds XP to a user's current XP amount")
      .addUserOption((option) => option.setName("member").setDescription("The user to add the XP to").setRequired(true))
      .addIntegerOption((option) => option.setName("amount").setDescription("The amount of XP to add").setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("remove_xp")
      .setDescription("Remove XP from a user's current XP amount")
      .addUserOption((option) => option.setName("member").setDescription("The user to remove the XP from").setRequired(true))
      .addIntegerOption((option) => option.setName("amount").setDescription("The amount of XP to remove").setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("reset")
      .setDescription("Reset a user's XP amount to 0 (USE WITH CAUTION)")
      .addUserOption((option) => option.setName("member").setDescription("The user to reset").setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("set_xp")
      .setDescription("Set a user's XP amount to a specific amount")
      .addUserOption((option) => option.setName("member").setDescription("The user set the XP for").setRequired(true))
      .addIntegerOption((option) => option.setName("amount").setDescription("The amount of XP to set").setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("set_level")
      .setDescription("Set a user's level to a specific amount")
      .addUserOption((option) => option.setName("member").setDescription("The user to set the level for").setRequired(true))
      .addIntegerOption((option) => option.setName("level").setDescription("The level to set").setRequired(true))
  );

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  // Permission check
  const roleID = settings.roles.permissions.levels;
  if (!interaction.member.roles.cache.has(roleID)) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${roleID}> role or higher can use that!`)] });
  }

  const user = interaction.options.getUser("member");
  const amount = interaction.options.getInteger("amount");
  const level = interaction.options.getInteger("level");

  const subCommand = interaction.options.getSubcommand();
  switch (subCommand) {
    case "add_xp": {
      if (amount <= 0) {
        return interaction.editReply({ embeds: [error("XP amount has to be a positive number")] });
      }

      const newXP = await DiscordRankup.addXP(user.id, interaction.guild.id, amount, true);
      interaction.editReply({ embeds: [success(`Added \`${amount}\` XP to <@${user.id}> | New total XP: \`${newXP}\``)] });
      break;
    }

    case "remove_xp": {
      if (amount <= 0) {
        return interaction.editReply({ embeds: [error("XP amount has to be a positive number")] });
      }

      const newXP = await DiscordRankup.removeXP(user.id, interaction.guild.id, amount, false);
      interaction.editReply({ embeds: [success(`Removed \`${amount}\` XP from <@${user.id}> | New total XP: \`${newXP}\``)] });
      break;
    }

    case "reset": {
      const newXP = await DiscordRankup.resetXP(user.id, interaction.guild.id);
      interaction.editReply({ embeds: [success(`Reset XP amount for <@${user.id}> | New total XP: \`${newXP}\``)] });
      break;
    }

    case "set_xp": {
      if (amount < 0) {
        return interaction.editReply({ embeds: [error("XP amount cannot be a negative number")] });
      }

      const newXP = await DiscordRankup.setXP(user.id, interaction.guild.id, amount, true);
      interaction.editReply({ embeds: [success(`Set total XP for <@${user.id}> to \`${newXP}\``)] });
      break;
    }

    case "set_level": {
      if (amount < 0) {
        return interaction.editReply({ embeds: [error("Level cannot be a negative number")] });
      }

      const xpRequired = DiscordRankup.requiredXP(level);
      const newXP = await DiscordRankup.setXP(user.id, interaction.guild.id, xpRequired, true);
      interaction.editReply({ embeds: [success(`Set level for <@${user.id}> to \`${level}\` | New total XP: \`${newXP}\``)] });
      break;
    }
  }
}

export { name, data, execute };
