import { DiscordRankup, Randomizer } from "discord-rankup";
import { settings } from "../config.js";
import { env } from "../config.js";
const { min_Xp, max_Xp, xpCooldown } = settings;

export async function startLevelSystem(client) {
  await DiscordRankup.init(env.getMongoUri(), client);
}

const onCooldown = new Set();
export function handleChatXp(msg) {
  if (onCooldown.has(msg.author.id)) return;
  if (msg.author.bot) return;

  const xpToAdd = Randomizer.randomXP(min_Xp, max_Xp);
  DiscordRankup.addXP(msg.author.id, msg.guild.id, xpToAdd);

  onCooldown.add(msg.author.id);
  setTimeout(() => {
    onCooldown.delete(msg.author.id);
  }, xpCooldown);
}
