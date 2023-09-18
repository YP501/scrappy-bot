// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, ChannelType } from "discord.js";
import { error, success, warning } from "../structures/embeds.js";

const name = "lock";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Lock a channel")
  .addChannelOption((option) =>
    option.setName("channel").setDescription("The channel you wish to lock, defaults to the channel the command is being ran in").addChannelTypes(ChannelType.GuildText)
  )
  .addStringOption((option) => option.setName("reason").setDescription("The reason you are locking the channel").setRequired(false));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();
  const { options, guild } = interaction;

  const reason = options.getString("reason") || "No reason provided";
  const channel = options.getChannel("channel") || interaction.channel;

  if (!channel.permissionsFor(guild.id).has("SendMessages")) {
    return interaction.editReply({ embeds: [error("This channel is already locked")], ephemeral: true });
  }

  channel.permissionOverwrites.edit(guild.id, {
    SendMessages: false,
  });

  interaction.editReply({ embeds: [success(`Successfully locked <#${channel.id}>`)] });
  channel.send({ embeds: [warning(`This channel is locked with reason \`${reason}\``)] });
}

export { name, data, execute };
