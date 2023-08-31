import { success, warning } from "../structures/embeds.js";
import { Ban } from "../structures/schemas.js";
import { CronJob } from "cron";
import { settings, bot } from "../config.js";

export async function loadUnbans(client) {
  const guild = client.guilds.cache.get(bot.guild_id);
  const logChannel = guild.channels.cache.get(settings.channels.logging.ban);
  const currentBans = await Ban.find();

  for (const ban of currentBans) {
    if (ban.unbanTimestamp - Date.now() <= 0) {
      guild.bans.remove(ban.targetUser_id).catch(() => {});
      logChannel.send({ embeds: [warning(`<@${ban.targetUser_id}> has been unbanned by bot startup unban checker`)] });
      await Ban.deleteOne({ targetUser_id: ban.targetUser_id });
    } else {
      new CronJob(
        new Date(ban.unbanTimestamp),
        async () => {
          guild.bans.remove(ban.targetUser_id).catch(() => {});
          logChannel.send({ embeds: [success(`<@${ban.targetUser_id}> has been automatically unbanned`)] });
          await Ban.deleteOne({ targetUser_id: ban.targetUser_id });
        },
        null,
        true
      );
    }
  }
}
