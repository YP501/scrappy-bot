// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { error, success } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "server_embeds";
const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Send a predefined server embed if it happens to get deleted")
  .addStringOption((option) =>
    option
      .setName("variant")
      .setDescription("The variant of which embed to send")
      .addChoices(
        { name: "verify", value: "verify" }
        // {name: "unique_identifier", value: "unique_identifier"}
      )
      .setRequired(true)
  );

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  if (interaction.user.id !== "513709333494628355" && interaction.user.id !== "365024863548866563") {
    interaction.editReply({ embeds: [error("Only <@513709333494628355> and <@365024863548866563> can use that")] });
  }
  switch (interaction.options.getString("variant")) {
    case "verify": {
      const embed = new EmbedBuilder()
        .setTitle(`${settings.emojis.warning} Verification Required`)
        .setDescription(
          `To gain access to \`${interaction.guild.name}\` you need to prove you are a human by completing a Captcha. Click the \`verify\` button below to get started!`
        )
        .setThumbnail(interaction.guild.iconURL())
        .setColor("Purple");

      const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("verify").setLabel("Verify").setStyle(ButtonStyle.Success));

      interaction.channel.send({ embeds: [embed], components: [button] });
    }
  }
  await interaction.editReply({ embeds: [success("Successfully sent embed")] });
}

export { name, data, execute };
