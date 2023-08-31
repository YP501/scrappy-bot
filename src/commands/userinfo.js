// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";

const name = "userinfo";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Get some info on a user")
  .addUserOption((option) => option.setName("user").setDescription("The user to get information of").setRequired(true));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  const member = interaction.options.getMember("user");

  const joinedAt = member.joinedTimestamp;
  const roles = member.roles;
  const roleArray = roles.cache.map((role) => {
    if (role.name === "@everyone") {
      return "@everyone";
    } else {
      return `<@&${role.id}>`;
    }
  });

  const embed = new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle("User Information")
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "Tag", value: `<@${member.user.id}>`, inline: true },
      { name: "Joined", value: `<t:${Math.floor(joinedAt / 1000)}:R>`, inline: true },
      { name: "Bot?", value: member.user.bot ? "Yes" : "No", inline: true },
      { name: `Roles [${roles.cache.size}]`, value: roleArray.join(" ") }
    )
    .setFooter({ text: `User ID: ${interaction.user.id}` })
    .setColor("Purple");

  interaction.reply({ embeds: [embed] });
}

export { name, data, execute };
