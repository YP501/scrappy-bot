import { ActionRowBuilder, ButtonBuilder } from "discord.js";

function disableButtons(row) {
  const buttons = [];
  const buttonsJson = row.components;
  buttonsJson.forEach((button) => buttons.push(ButtonBuilder.from(button).setDisabled(true)));
  return new ActionRowBuilder().addComponents(buttons);
}

export { disableButtons };
