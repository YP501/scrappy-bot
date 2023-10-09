// eslint-disable-next-line no-unused-vars
import { ActionRowBuilder, ButtonBuilder, Message } from "discord.js";

/**
 *
 * @param {Message} msg
 */
export function disableButtons(msg) {
  const row = msg.components[0];
  const buttons = [];
  const buttonsJson = row.components;
  buttonsJson.forEach((button) => buttons.push(ButtonBuilder.from(button).setDisabled(true)));
  return new ActionRowBuilder().addComponents(buttons);
}
