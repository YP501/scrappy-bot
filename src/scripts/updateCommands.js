import fs from "fs";
import chalk from "chalk";
import { REST } from "@discordjs/rest";
import { env, bot } from "../config.js";
import { Routes } from "discord.js";

const slashCommands = [];
const commandFiles = fs.readdirSync("./src/commands").filter((file) => file.endsWith(".js"));
console.info(`[FILE-LOAD] Loading files, expecting ${commandFiles.length} files`);

for (const file of commandFiles) {
  try {
    console.info(`[FILE-LOAD] Loading file: ${file}`);
    const command = await import(`../commands/${file}`);
    if (command.name) {
      slashCommands.push(command.data.toJSON());
      console.info(`[FILE-LOAD] Loaded file: ${file}`);
    }
  } catch (error) {
    console.error(chalk.bold.rgb(0, 255, 0).underline(`[FILE-LOAD] Unloaded: ${file}`));
    console.error(chalk.red(error.stack));
  }
}

console.info(`[FILE-LOAD] ${slashCommands.length} files are loaded and ready to be sent`);
let now = Date.now();

try {
  console.info("[APP-REFR] Started updating application (/) commands");
  const rest = new REST({ version: 10 }).setToken(env.getToken());
  await rest.put(Routes.applicationGuildCommands(bot.application_id, bot.guild_id), { body: slashCommands });
  const then = Date.now();
  console.info(`[APP-REFR] Successfully updated application (/) commands after ${then - now}ms`);
} catch (error) {
  const then = Date.now();
  console.error(chalk.bold.rgb(0, 255, 0).underline(`[APP-REFR] Failed to update application (/) commands after ${then - now}ms`));
  console.error(chalk.red(error.stack));
}
