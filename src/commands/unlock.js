// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, ChannelType } from "discord.js";
import { error, success } from "../structures/embeds.js";

const name = "unlock";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Unlock a channel")
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("The channel you wish to unlock, defaults to the channel the command is being ran in")
      .addChannelTypes(ChannelType.GuildText)
  );

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();
  const { options, guild } = interaction;

  const reason = options.getString("reason") || "No reason provided";
  const channel = options.getChannel("channel") || interaction.channel;

  if (channel.permissionsFor(guild.id).has("SendMessages")) {
    return interaction.editReply({ embeds: [error("This channel is not currently locked")], ephemeral: true });
  }

  channel.permissionOverwrites.edit(guild.id, {
    SendMessages: null,
  });

  interaction.editReply({ embeds: [success(`Successfully unlocked <#${channel.id}>`)] });
}

export { name, data, execute };
