// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import { error, success, warning } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "purge";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Mass-delete messages in a channel")
  .addSubcommand((cmd) =>
    cmd
      .setName("any")
      .setDescription("Bulkdelete a certain amount of message of all types")
      .addIntegerOption((option) => option.setName("amount").setDescription("The amount of messages to delete").setMinValue(1).setMaxValue(100).setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("before")
      .setDescription("Bulkdelete a certain amount of messages sent before a specific message")
      .addStringOption((option) => option.setName("message_id").setDescription("The ID of the message to take into consideration").setRequired(true))
      .addIntegerOption((option) => option.setName("amount").setDescription("The amount of messages to delete").setMinValue(1).setMaxValue(100).setRequired(true))
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("after")
      .setDescription("Bulkdelete a certain amount of messages sent after a specific message")
      .addStringOption((option) => option.setName("message_id").setDescription("The ID of the message to take into consideration").setRequired(true))
      .addIntegerOption((option) => option.setName("amount").setDescription("The amount of messages to delete").setMinValue(1).setMaxValue(100).setRequired(true))
  );

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  // Permission check
  const role = interaction.guild.roles.cache.get(settings.roles.permissions.purge);
  if (interaction.member.roles.highest.position < role.position) {
    return interaction.editReply({ embeds: [error(`Only members with the <@&${role.id}> role or higher can use that!`)] });
  }

  await interaction.editReply({ embeds: [warning("Deleting messages...")] });

  const amount = interaction.options.getInteger("amount");
  const message_id = interaction.options.getString("message_id");
  let fetchOptions = null;

  const subCommand = interaction.options.getSubcommand();
  switch (subCommand) {
    case "any": {
      fetchOptions = { limit: amount };
      break;
    }
    case "before": {
      fetchOptions = { limit: amount, before: message_id };
      break;
    }
    case "after": {
      fetchOptions = { limit: amount, after: message_id };
      break;
    }
  }

  const messages = (await interaction.channel.messages.fetch(fetchOptions)).filter((msg) => msg.bulkDeletable);
  if (messages.size === 0) {
    return interaction.editReply({ embeds: [error("No messages found to delete with those options")] });
  }
  await interaction.channel.bulkDelete(messages);
  await interaction.editReply({ embeds: [success(`Deleted ${messages.size} messages`)] });
  if (messages.size < amount) {
    interaction.followUp({ embeds: [warning("Some messages were older than 14 days and couldn't be purged")], ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle("New Purge")
    .setFields(
      { name: "Channel", value: `<#${interaction.channel.id}>`, inline: true },
      { name: "Actor", value: `<@${interaction.user.id}>`, inline: true },
      { name: "\u200b", value: "\u200b", inline: true },
      { name: "Filter", value: `\`${subCommand}\``, inline: true },
      { name: "Amount", value: `\`${messages.size}\``, inline: true },
      { name: "\u200b", value: "\u200b", inline: true }
    )
    .setTimestamp()
    .setColor("Purple");
  interaction.guild.channels.cache.get(settings.channels.logging.purge).send({ embeds: [embed] });
}

export { name, data, execute };
