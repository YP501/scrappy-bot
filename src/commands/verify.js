import {
  SlashCommandBuilder,
  // eslint-disable-next-line no-unused-vars
  CommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
} from "discord.js";
import { CaptchaGenerator } from "captcha-canvas";
import { disableButtons } from "../functions/components.js";
import { warning, success, error } from "../structures/embeds.js";
import { settings } from "../config.js";

const name = "verify";
const data = new SlashCommandBuilder().setName(name).setDescription("Verify yourself as a member so we know you are not a bot");
const inSession = new Set();

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const role = interaction.member.roles.cache.get("1153341921171886200");
  if (role) {
    return interaction.editReply({ embeds: [warning("You are already verified")] });
  }
  if (inSession.has(interaction.user.id)) {
    return interaction.editReply({ embeds: [error("You are already in a verification session")] });
  }
  inSession.add(interaction.user.id);

  const captcha = new CaptchaGenerator().setDimension(150, 300).setDecoy({ opacity: 0.5, color: "#ffffff", size: 30, total: 10 });
  const buffer = captcha.generateSync();
  const captchaImage = new AttachmentBuilder(buffer, { name: "captcha.png" });
  let captchaAnswer = captcha.text;
  const embed = new EmbedBuilder()
    .setTitle("Active Verification Session")
    .setDescription(
      `
    Click \`submit\` below to answer the captcha.
    Click \`refresh\` to get a new captcha.
    Click \`Cancel\` to cancel the current session.
    
    **NOTES:**
    - The captcha doesn't include spaces.\n- The captcha isn't case sensitive.\n- Session expires after 5 minutes.\n- You have 3 attempts before the captcha refreshes
    `
    )
    .setImage("attachment://captcha.png")
    .setFooter({ text: `Sent from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
    .setColor("Purple");

  let attemptCounter = 1;
  const submitButton = new ButtonBuilder().setCustomId("submit").setLabel("Submit").setStyle(ButtonStyle.Primary);
  const refreshButton = new ButtonBuilder().setCustomId("refresh").setLabel("Refresh").setStyle(ButtonStyle.Secondary);
  const cancelButton = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);
  const buttonRow = new ActionRowBuilder().addComponents([submitButton, refreshButton, cancelButton]);

  const msg = await interaction.user.send({ embeds: [embed], files: [captchaImage], components: [buttonRow] });
  interaction.editReply({ embeds: [success("A verification session has been started in your DM's")] });

  const buttonCollector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000 });
  buttonCollector.on("collect", async (buttonInteraction) => {
    switch (buttonInteraction.customId) {
      case "submit": {
        const submitField = new TextInputBuilder()
          .setCustomId("submit_field")
          .setLabel("Submit answer")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(6)
          .setMinLength(6)
          .setPlaceholder("Captcha code consisting of 6 characters")
          .setRequired(true);
        const submitModal = new ModalBuilder().setCustomId("modal").setTitle("Verification system");
        submitModal.addComponents(new ActionRowBuilder().addComponents(submitField));
        buttonInteraction.showModal(submitModal);

        const modalInteraction = await buttonInteraction.awaitModalSubmit({ time: 300_000 });
        await modalInteraction.deferReply({ ephemeral: true });
        const answer = modalInteraction.fields.getTextInputValue("submit_field").toUpperCase();
        if (answer !== captchaAnswer) {
          if (attemptCounter < 3) {
            modalInteraction.editReply({ embeds: [error(`That is not correct! You have ${3 - attemptCounter} tries left.`)] });
            attemptCounter += 1;
          } else {
            attemptCounter = 1;
            modalInteraction.editReply({ embeds: [warning("You failed 3 times, the captcha has been refreshed.")] });
            const newCaptcha = new CaptchaGenerator().setDimension(150, 300).setDecoy({ opacity: 0.5, color: "#ffffff", size: 30, total: 10 });
            const newBuffer = newCaptcha.generateSync();
            captchaAnswer = newCaptcha.text;
            const newCaptchaImage = new AttachmentBuilder(newBuffer, { name: "captcha.png" });
            msg.edit({ embeds: [embed], files: [newCaptchaImage] });
          }
        } else {
          modalInteraction.editReply({ embeds: [success("You have been verified!")] });
          interaction.member.roles.add(settings.roles.systems.verify);
          buttonCollector.stop();
        }
        break;
      }
      case "refresh": {
        const newCaptcha = new CaptchaGenerator().setDimension(150, 300).setDecoy({ opacity: 0.5, color: "#ffffff", size: 30, total: 10 });
        const newBuffer = newCaptcha.generateSync();
        captchaAnswer = newCaptcha.text;
        const newCaptchaImage = new AttachmentBuilder(newBuffer, { name: "captcha.png" });
        msg.edit({ embeds: [embed], files: [newCaptchaImage] });
        attemptCounter = 1;
        buttonInteraction.reply({ embeds: [success("The captcha has been refreshed")], ephemeral: true });
        break;
      }
      case "cancel": {
        buttonInteraction.reply({ embeds: [warning("Session cancelled. Run `/verify` again to start a new session")], ephemeral: true });
        buttonCollector.stop();
        break;
      }
    }
  });

  buttonCollector.on("end", async () => {
    msg.edit({ embeds: [embed.setTitle("Inactive Verification Session").setColor("Red")], components: [disableButtons(msg.components[0])] });
    inSession.delete(interaction.user.id);
  });
}

export { name, data, execute };
