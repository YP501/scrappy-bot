import { EmbedBuilder } from "discord.js";
import { CronJob } from "cron";
import { settings, bot } from "../config.js";

export async function initMysteryMerchant(client) {
  const arriveJob = new CronJob("0 8,20 * * *", arriveManager, null, true, "Europe/Amsterdam");
  const leaveJob = new CronJob("10 8,20 * * *", leaveManager, null, true, "Europe/Amsterdam");

  // Checking embed msg
  const channel = client.channels.cache.get(settings.channels.systems.mysteryMerchant);
  let embedMsg = (await channel.messages.fetch()).find((msg) => msg.author.id === bot.application_id);
  let shouldPing = false;

  // Setting manager functions
  async function arriveManager() {
    const arriveEmbed = new EmbedBuilder()
      .setTitle("Mystery Merchant Information")
      .setDescription("To get notified on updates, check <#907253130973024256>")
      .setThumbnail("https://cdn.discordapp.com/attachments/761949188501798962/1146110108787552256/Mystery_Merchant.webp")
      .addFields(
        { name: "Currently in-game?", value: "`Yes`", inline: true },
        { name: "Time until departure", value: `<t:${leaveJob.nextDate().ts / 1000}:R>`, inline: true }
      )
      .setFooter({ text: "Last updated" })
      .setTimestamp()
      .setColor("Green");

    // Send embed if embed message is there, else edit the embed message
    if (!embedMsg) {
      embedMsg = await channel.send({ embeds: [arriveEmbed] });
    } else {
      await embedMsg.edit({ embeds: [arriveEmbed] });
    }

    if (shouldPing) {
      channel.send(`<@&${settings.roles.systems.mysteryMerchant}>`).then((msg) => msg.delete());
    }
  }

  async function leaveManager() {
    const leaveEmbed = new EmbedBuilder()
      .setTitle("Mystery Merchant Information")
      .setDescription("To get notified on updates, check <#1158770462801809563>")
      .setThumbnail("https://cdn.discordapp.com/attachments/761949188501798962/1146110108787552256/Mystery_Merchant.webp")
      .addFields(
        { name: "Currently in-game?", value: "`No`", inline: true },
        { name: "Time until next arrival", value: `<t:${arriveJob.nextDate().ts / 1000}:R>`, inline: true }
      )
      .setFooter({ text: "Last updated" })
      .setTimestamp()
      .setColor("Red");

    // Send embed if embed message is there, else edit the embed message
    if (!embedMsg) {
      embedMsg = await channel.send({ embeds: [leaveEmbed] });
    } else {
      await embedMsg.edit({ embeds: [leaveEmbed] });
    }

    if (shouldPing) {
      channel.send(`<@&${settings.roles.systems.mysteryMerchant}>`).then((msg) => msg.delete());
    }
  }

  // Checking if current state should be in arrive or leave and execute manager accordingly
  if (leaveJob.nextDate().ts - Date.now() < 600000) {
    await arriveManager();
  } else {
    await leaveManager();
  }
  shouldPing = true;
}
