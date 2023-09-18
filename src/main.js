// Imports
import { Client, Collection, GatewayIntentBits, Routes, ActivityType, EmbedBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { connect } from "mongoose";
import chalk from "chalk";
import fs from "fs";
import { warning } from "./structures/embeds.js";
import { Blacklist, Whitelist } from "./structures/schemas.js";
import { filterUrl } from "./systems/urlFilter.js";
import { loadUnbans } from "./systems/autoUnban.js";
import { initMysteryMerchant } from "./systems/mysteryMerchant.js";
import { settings, bot } from "./config.js";

const activeToken = process.env.token_dev;
const rest = new REST({ version: 10 }).setToken(activeToken);

// Initializing client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();
client.buttons = new Collection();
client.blacklist = new Set();
client.whitelistedUrls = new Set();
export { client, activeToken };

console.info(chalk.bold.white("-".repeat(115)));

(async () => {
  // Command loading
  const slashCommands = [];
  const commandFiles = fs.readdirSync("./src/commands").filter((file) => file.endsWith(".js"));
  console.info(`[FILE-LOAD] Loading files, expecting ${commandFiles.length} files`);

  for (const file of commandFiles) {
    try {
      console.info(`[FILE-LOAD] Loading file: ${file}`);
      const command = await import(`./commands/${file}`);
      if (command.name) {
        slashCommands.push(command.data.toJSON());
        client.commands.set(command.name, command);
        console.info(`[FILE-LOAD] Loaded file: ${file}`);
      }
    } catch (error) {
      console.error(`[FILE-LOAD] Unloaded: ${file}`);
      console.error(`[FILE-LOAD] ${error}\n${error.stack}`);
    }
  }

  console.info(`[FILE-LOAD] ${slashCommands.length} files are loaded and ready to be sent`);
  let now = Date.now();

  try {
    console.info("[APP-REFR] Started refreshing application (/) commands");
    await rest.put(Routes.applicationGuildCommands(bot.application_id, bot.guild_id), { body: slashCommands });
    const then = Date.now();
    console.info(`[APP-REFR] Successfully reloaded application (/) commands after ${then - now}ms`);
  } catch (error) {
    const then = Date.now();
    console.info(`[APP-REFR] Failed to reload application (/) commands after ${then - now}ms`);
    console.error(`[APP-REFR] ${error}`);
  }

  // Button loading
  console.info("[BTN-INIT] Setting button collection");
  const buttonFiles = fs.readdirSync("./src/buttons");
  for (const file of buttonFiles) {
    const button = await import(`./buttons/${file}`);
    if (!button.id) console.log("No id found");
    client.buttons.set(button.id, button);
  }
  console.info("[BTN-INIT] Finished setting buttons");

  // Database init
  now = Date.now();
  try {
    console.info("[DB-INIT] Connecting to DataBase");
    await connect(process.env.db_dev);
    const then = Date.now();
    console.info(`[DB-INIT] Successfully connected to DataBase after ${then - now}ms`);

    console.info("[DB-INIT] Setting up local blacklist");
    let queryResult = await Blacklist.find();
    queryResult.forEach((entry) => {
      client.blacklist.add(entry.target);
    });
    console.info("[DB-INIT] Successfully set up local blacklist");

    console.info("[DB-INIT] Setting up local URL whitelist");
    (await Whitelist.find()).forEach((entry) => {
      client.whitelistedUrls.add(entry.url);
    });
    console.info("[DB-INIT] Successfully set up local url whitelist");
  } catch (error) {
    const then = Date.now();
    console.info(`[DB-INIT] DataBase initializing error after ${then - now}ms`);
    console.error(`[DB-INIT] ${error}`);
  }

  client.login(activeToken);
})();

//////////////////////////////////////////////////////////////////////////

client.once("ready", () => {
  loadUnbans(client);
  console.info("[BAN-MANAGE] Removed expired bans and put jobs for the rest");

  initMysteryMerchant(client);
  console.info("[MM-LOAD] Loaded mystery merchant system");

  console.log(chalk.bold.white("-".repeat(115)));
  console.info(`[READY] Logged in as ${client.user.tag} (${client.user.id})`);
  console.info(`[READY] Login at ${new Date()}`);
  console.info(`[READY] Invite URL: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`);
  console.log(chalk.bold.white("-".repeat(115)));

  client.user.setActivity({ name: "(/) commands!", type: ActivityType.Listening });
});

const onCooldown = new Set();
client.on("interactionCreate", async (interaction) => {
  // SLASH COMMAND INTERACTION
  if (interaction.isCommand()) {
    if (!client.commands.has(interaction.commandName)) return;

    // Command cooldown
    if (onCooldown.has(interaction.user.id)) {
      return interaction.reply({ content: `You are on a ${settings.commandCooldown / 1000} second cooldown, calm down good sir.`, ephemeral: true });
    } else {
      onCooldown.add(interaction.user.id);
      setTimeout(() => {
        onCooldown.delete(interaction.user.id);
      }, settings.commandCooldown);
    }

    // Command Blacklist
    if (client.blacklist.has(interaction.user.id)) {
      return interaction.reply({ embeds: [warning("You cannot use my commands since you are blacklisted")], ephemeral: true });
    }

    try {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return interaction.reply({ content: `There is no command linked to ${interaction.commandName} in \`client.commands\``, ephemeral: true });
      await cmd.execute(interaction);
    } catch (error) {
      console.error(`${chalk.bold.rgb(0, 255, 0).underline(`Command: ${interaction.commandName} @ ${new Date().toString()}`)}`);
      console.error(`${chalk.red(error.stack)}`);
      if (!interaction.replied && !interaction.deferred) {
        interaction.reply({
          embeds: [warning("An error occurred while executing this command! Please contact <@513709333494628355>")],
          ephemeral: true,
        });
      } else {
        interaction.followUp({
          embeds: [warning("An error occurred while executing this command! Please contact <@513709333494628355>")],
          ephemeral: true,
        });
      }
    }
  }
  // BUTTON INTERACTION
  else if (interaction.isButton()) {
    const button = client.buttons.get(interaction.customId);
    if (!button) return;
    try {
      button.execute(interaction);
    } catch (error) {
      console.error(`${chalk.bold.rgb(0, 255, 0).underline(`Command: ${interaction.commandName} @ ${new Date().toString()}`)}`);
      console.error(`${chalk.red(error.stack)}`);
      if (!interaction.replied && !interaction.deferred) {
        interaction.reply({
          embeds: [warning("An error occurred with this button! Please contact <@513709333494628355>")],
          ephemeral: true,
        });
      } else {
        interaction.followUp({
          embeds: [warning("An error occurred with this button! Please contact <@513709333494628355>")],
          ephemeral: true,
        });
      }
    }
  }
});

client.on("messageCreate", (msg) => {
  filterUrl(msg);
});

client.on("error", (error) => {
  console.error(`${new Date().toLocaleString("nl-NL", { timeZone: "CET" })}\nError: ${error.stack}`);
});
