import { EmbedBuilder } from "discord.js";
import { settings } from "../config.js";

const error = (string) => new EmbedBuilder().setDescription(`${settings.emojis.cross} ${string}`).setColor("Red");
const warning = (string) => new EmbedBuilder().setDescription(`${settings.emojis.warning} ${string}`).setColor("Orange");
const success = (string) => new EmbedBuilder().setDescription(`${settings.emojis.check} ${string}`).setColor("Green");

const infraction_log = (infraction) => {
  return new EmbedBuilder()
    .setTitle(`New ${infraction.type}`)
    .setDescription(infraction.reason)
    .addFields(
      { name: "User", value: `<@${infraction.targetUser_id}>`, inline: true },
      { name: "Moderator", value: `<@${infraction.moderatorUser_id}>`, inline: true },
      { name: "Date", value: `<t:${infraction.date}:f>`, inline: true },
      { name: "Infraction ID", value: `\`${infraction.id}\`` }
    )
    .setColor("Purple");
};

const infraction_dm = (infraction) => {
  const title = infraction.type.charAt(0).toUpperCase() + infraction.type.slice(1);
  return new EmbedBuilder()
    .setTitle(`${title} information`)
    .setDescription(infraction.reason)
    .addFields(
      { name: "Moderator", value: `<@${infraction.moderatorUser_id}>`, inline: true },
      { name: "Date", value: `<t:${infraction.date}:f>`, inline: true },
      { name: "Infraction ID", value: `\`${infraction.id}\`` }
    )
    .setColor("Red");
};

export { error, warning, success, infraction_log, infraction_dm };
