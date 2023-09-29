// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, codeBlock } from "discord.js";
import { formatMillisecondTime, getNpmPackages } from "../functions/misc.js";
import os from "os";
import { bot } from "../config.js";

const name = "info";
const data = new SlashCommandBuilder().setName(name).setDescription("Receive some information about this bot");

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
  await interaction.deferReply();

  const ramUsageMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const ramUsageFormatted = ramUsageMB < 100 ? `${Math.round(ramUsageMB * 100) / 100} MB` : `${Math.round((ramUsageMB / 1000) * 100) / 100} GB`; // MB to GB, also quite unholy

  const aboutEmbed = new EmbedBuilder()
    .setTitle(`${interaction.client.user.username} Statistics`)
    .setDescription("[Github Repository](https://github.com/YP501/scrappy-bot)")
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .addFields(
      {
        name: "Package info",
        value: codeBlock("txt", `OS - ${os.platform()}${await getNpmPackages()}`),
        inline: false,
      },
      {
        name: "Bot Info",
        value: `
        >>> Uptime: ${formatMillisecondTime(interaction.client.uptime)}
        Version: ${bot.version}
        Developer: <@513709333494628355>
        `,
        inline: true,
      },
      {
        name: "Client Info",
        value: `
        >>> RAM Usage: ${ramUsageFormatted}
        Latency: ${interaction.client.ws.ping}ms
        Users Loaded: ${interaction.client.users.cache.size}
        `,
        inline: true,
      }
    )
    .setFooter({ text: `User ID: ${interaction.user.id}` })
    .setColor("DarkPurple");
  interaction.editReply({ embeds: [aboutEmbed] });
}

export { name, data, execute };
