import {
  // eslint-disable-next-line no-unused-vars
  ButtonInteraction,
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
import { warning, success, error } from "../structures/embeds.js";
import { settings } from "../config.js";

/**
 * @param {ButtonInteraction} interaction
 */
const id = "verify";

const inSession = new Set();
async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const { user } = interaction;

  const role = interaction.member.roles.cache.get("1153341921171886200");
  if (role) {
    return interaction.editReply({ embeds: [warning("You are already verified")] });
  }
  if (inSession.has(user.id)) {
    return interaction.editReply({ embeds: [error("You are already in a verification session")] });
  }

  // Checking if user has DMs open
  let msg = null;
  try {
    msg = await user.send({ embeds: [warning("Generating Captcha...")] });
  } catch (_) {
    return interaction.editReply({ embeds: [warning("Was unable to send you a DM! Make sure they are set to open")] });
  }
  inSession.add(user.id);

  const captcha = new CaptchaGenerator()
    .setDimension(150, 300)
    .setCaptcha({ color: "#9c59b6", opacity: 1 })
    .setTrace({ color: "#9c59b6", opacity: 1 })
    .setDecoy({ opacity: 1, color: "#6d3e80", size: 30, total: 10 });
  const buffer = captcha.generateSync();
  const captchaImage = new AttachmentBuilder(buffer, { name: "captcha.png" });
  let captchaAnswer = captcha.text;
  const embed = new EmbedBuilder()
    .setAuthor({ name: `Sent from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
    .setTitle("Active Verification Session")
    .setDescription(
      `
    >>> Click \`submit\` to answer the captcha.
    Click \`refresh\` refresh the Captcha.
    Click \`Cancel\` to cancel the session.
    `
    )
    .addFields({
      name: "Notes:",
      value: `
    ${settings.emojis.warning} The captcha doesn't include spaces.
    ${settings.emojis.warning} The captcha isn't case sensitive.
    ${settings.emojis.warning} Session expires after ${settings.verifyTime / 1000 / 60} minutes.
    ${settings.emojis.warning} You have 1 chance before you get a new Captcha
    `,
    })
    .setImage("attachment://captcha.png")
    .setFooter({ text: `Session time left: ${settings.verifyTime / 1000} seconds` })
    .setColor("Purple");

  const submitButton = new ButtonBuilder().setCustomId("submit").setLabel("Submit").setStyle(ButtonStyle.Primary);
  const refreshButton = new ButtonBuilder().setCustomId("refresh").setLabel("Refresh").setStyle(ButtonStyle.Secondary);
  const cancelButton = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);
  const buttonRow = new ActionRowBuilder().addComponents([submitButton, refreshButton, cancelButton]);

  // Sending the captcha
  await msg.edit({ embeds: [embed], files: [captchaImage], components: [buttonRow] });

  interaction.editReply({ embeds: [success("A verification session has been started in your DM's")] });

  const buttonCollector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: settings.verifyTime });

  let timeLeft = settings.verifyTime / 1000;
  const countdownTimer = setInterval(() => {
    timeLeft -= 10;
    msg.edit({ embeds: [embed.setFooter({ text: `Session time left: ${timeLeft} seconds` })] });
  }, 10_000);

  buttonCollector.on("collect", (buttonInteraction) => {
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

        buttonInteraction
          .awaitModalSubmit({ time: settings.verifyTime })
          .then(async (modalInteraction) => {
            await modalInteraction.deferReply({ ephemeral: true });

            const answer = modalInteraction.fields.getTextInputValue("submit_field").toUpperCase();
            if (answer !== captchaAnswer) {
              modalInteraction.editReply({ embeds: [warning("That's not right! Refreshing captcha")] });
              const newCaptcha = new CaptchaGenerator()
                .setDimension(150, 300)
                .setCaptcha({ color: "#9c59b6", opacity: 1 })
                .setTrace({ color: "#9c59b6", opacity: 1 })
                .setDecoy({ opacity: 1, color: "#6d3e80", size: 30, total: 10 });
              const newBuffer = newCaptcha.generateSync();
              const newCaptchaImage = new AttachmentBuilder(newBuffer, { name: "captcha.png" });
              captchaAnswer = newCaptcha.text;

              msg.edit({ embeds: [embed], files: [newCaptchaImage] });
            } else {
              modalInteraction.editReply({ embeds: [success("You have been verified!")] });
              interaction.member.roles.add(settings.roles.systems.onVerification);

              const embed = new EmbedBuilder()
                .setTitle("New User Verified")
                .setDescription(`>>> **User:** <@${user.id}>\n**Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`)
                .setThumbnail(user.displayAvatarURL())
                .setColor("Green")
                .setTimestamp();
              interaction.guild.channels.cache.get(settings.channels.logging.verify).send({ embeds: [embed] });

              buttonCollector.stop();
            }
          })
          .catch(() => {}); // Prevent "Collector received no interactions before ending with reason: time"
        break;
      }
      case "refresh": {
        const newCaptcha = new CaptchaGenerator()
          .setDimension(150, 300)
          .setCaptcha({ color: "#9c59b6", opacity: 1 })
          .setTrace({ color: "#9c59b6", opacity: 1 })
          .setDecoy({ opacity: 1, color: "#6d3e80", size: 30, total: 10 });
        const newBuffer = newCaptcha.generateSync();
        captchaAnswer = newCaptcha.text;
        const newCaptchaImage = new AttachmentBuilder(newBuffer, { name: "captcha.png" });
        msg.edit({ embeds: [embed], files: [newCaptchaImage] });
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
    msg.edit({
      embeds: [embed.setTitle("Inactive Verification Session").setColor("Red").setFooter({ text: "Session time left: None" }).setImage(null)],
      components: [],
      files: [],
    });
    inSession.delete(user.id);
    clearInterval(countdownTimer);
  });
}

export { id, execute };
