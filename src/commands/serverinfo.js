// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ChannelType } from "discord.js";

const name = "serverinfo";
const data = new SlashCommandBuilder().setName(name).setDescription("Get some info on the server");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();
  const { guild } = interaction;

  const owner = guild.ownerId;
  const createdAt = guild.createdTimestamp;

  const channels = await guild.channels.fetch();
  const categories = channels.filter((channel) => channel.type === ChannelType.GuildCategory).size;
  const textChannels = channels.filter((channel) => channel.type === ChannelType.GuildText).size;
  const voiceChannels = channels.filter((channel) => channel.type === ChannelType.GuildVoice).size;

  const members = await guild.members.fetch();
  const totalMembers = members.size;
  const humans = members.filter((member) => !member.user.bot).size;
  const bots = members.filter((member) => member.user.bot).size;
  const roles = (await guild.roles.fetch()).size;

  const embed = new EmbedBuilder()
    .setTitle("Server Information")
    .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
    .setThumbnail(guild.iconURL())
    .addFields(
      { name: "Owner", value: `<@${owner}>`, inline: true },
      { name: "Created", value: `<t:${Math.floor(createdAt / 1000)}:R>`, inline: true },
      { name: "Channel Categories", value: categories.toString(), inline: true },
      { name: "Text Channels", value: textChannels.toString(), inline: true },
      { name: "Voice Channels", value: voiceChannels.toString(), inline: true },
      { name: "Members", value: totalMembers.toString(), inline: true },
      { name: "Humans", value: humans.toString(), inline: true },
      { name: "Bots", value: bots.toString(), inline: true },
      { name: "Roles", value: roles.toString(), inline: true }
    )
    .setFooter({ text: `User ID: ${interaction.user.id}` })
    .setColor("Purple");

  interaction.editReply({ embeds: [embed] });
}

export { name, data, execute };
