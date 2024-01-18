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
import { startLevelSystem, handleChatXp } from "./systems/levels.js";
import { initMysteryMerchant } from "./systems/mysteryMerchant.js";
import { settings, bot, env } from "./config.js";

const rest = new REST({ version: 10 }).setToken(env.getToken());

// Initializing client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();
client.buttons = new Collection();
client.blacklist = new Set();
client.whitelistedUrls = new Set();
export { client };

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
      console.error(chalk.bold.rgb(0, 255, 0).underline(`[FILE-LOAD] Unloaded: ${file}`));
      console.error(chalk.red(error.stack));
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
    console.error(chalk.bold.rgb(0, 255, 0).underline(`[APP-REFR] Failed to reload application (/) commands after ${then - now}ms`));
    console.error(chalk.red(error.stack));
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
    const connection = await connect(env.getMongoUri());
    const then = Date.now();
    console.info(`[DB-INIT] Successfully connected to ${connection.connections[0].name} after ${then - now}ms`);

    startLevelSystem(client);
    console.info("[DB-INIT] Level system started");

    let queryResult = await Blacklist.find();
    queryResult.forEach((entry) => {
      client.blacklist.add(entry.target);
    });
    console.info("[DB-INIT] Successfully set up local blacklist");

    (await Whitelist.find()).forEach((entry) => {
      client.whitelistedUrls.add(entry.url);
    });
    console.info("[DB-INIT] Successfully set up local url whitelist");
  } catch (error) {
    const then = Date.now();
    console.error(chalk.bold.rgb(0, 255, 0).underline(`[DB-INIT] DataBase initializing error after ${then - now}ms`));
    console.error(chalk.red(error.stack));
  }

  client.login(env.getToken());
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
  // Feature Blacklist
  if (client.blacklist.has(interaction.user.id)) {
    return interaction.reply({ embeds: [warning("You cannot use my features since you are blacklisted")], ephemeral: true });
  }

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

    try {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return interaction.reply({ content: `There is no command linked to ${interaction.commandName} in \`client.commands\``, ephemeral: true });
      await cmd.execute(interaction);
    } catch (error) {
      console.error(`${chalk.bold.rgb(0, 255, 0).underline(`Command: ${interaction.commandName} @ ${new Date().toString()}`)}`);
      console.error(chalk.red(error.stack));
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
    try {
      const button = client.buttons.get(interaction.customId);
      if (!button) return;
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

client.on("messageCreate", async (msg) => {
  filterUrl(msg);
  handleChatXp(msg);
});

client.on("messageUpdate", async (oldMsg, newMsg) => {
  if (oldMsg.author.id === bot.application_id) return; // Prevent the bot from calling this event on itself
  if (oldMsg.content === newMsg.content) return; //Don't do anything if the message body isn't edited
  filterUrl(newMsg);

  if (!oldMsg.content) return; // To prevent dumb shenanigans like the bot updating its embeds

  const embed = new EmbedBuilder()
    .setTitle("Message Edited")
    .setDescription(`**Before:**\n${oldMsg.content}\n\n**After:**\n${newMsg.content}`)
    .setFields(
      { name: "Channel", value: `<#${oldMsg.channel.id}>`, inline: true },
      { name: "Message ID", value: `[${oldMsg.id}](${oldMsg.url})`, inline: true },
      { name: "\u200b", value: "\u200b", inline: true },
      { name: "Author", value: `<@${oldMsg.author.id}>`, inline: true },
      { name: "Created", value: `<t:${Math.floor(oldMsg.createdTimestamp / 1000)}:R>`, inline: true },
      { name: "\u200b", value: "\u200b", inline: true }
    )
    .setColor("Orange")
    .setTimestamp();
  client.channels.cache.get(settings.channels.logging.events.messageUpdate).send({ embeds: [embed] });
});

client.on("messageDelete", (msg) => {
  if (msg.author.id === bot.application_id) return; // Prevent the bot from calling this event on itself

  const content = msg.content || null;
  const attachment = msg.attachments.first();
  const url = attachment ? attachment.proxyURL : null;
  if (!url && !content) return; // Prevent sending if embed only message is deleted as we don't want to log those

  const embed = new EmbedBuilder()
    .setTitle("Message Deleted")
    .setDescription(content)
    .setFields(
      { name: "Channel", value: `<#${msg.channel.id}>`, inline: true },
      { name: "Message ID", value: `[${msg.id}](${msg.url})`, inline: true },
      { name: "\u200b", value: "\u200b", inline: true },
      { name: "Author", value: `<@${msg.author.id}>`, inline: true },
      { name: "Created", value: `<t:${Math.floor(msg.createdTimestamp / 1000)}:R>`, inline: true },
      { name: "\u200b", value: "\u200b", inline: true }
    )
    .setColor("Red")
    .setImage(url)
    .setTimestamp();

  client.channels.cache.get(settings.channels.logging.events.messageDelete).send({ embeds: [embed] });
});

client.on("guildMemberAdd", (member) => {
  const userEmbed = new EmbedBuilder()
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(`We are happy to have you here, ${member.user.displayName}! 🎉\nYou are our ${member.guild.memberCount}th member`)
    .setColor("Purple")
    .setTimestamp();

  const logEmbed = new EmbedBuilder()
    .setTitle("User Joined")
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(
      `>>> **User:** <@${member.user.id}>\n**Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n**Members:** ${member.guild.memberCount}`
    )
    .setColor("Orange")
    .setTimestamp();

  client.channels.cache.get(settings.channels.systems.welcome).send({ embeds: [userEmbed], content: `<@${member.user.id}>` });
  client.channels.cache.get(settings.channels.logging.events.guildMemberAdd).send({ embeds: [logEmbed] });
});

client.on("guildMemberRemove", (member) => {
  const embed = new EmbedBuilder()
    .setTitle("User Left")
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(`>>> **User:** <@${member.user.id}>\n**Joined:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n**Members:** ${member.guild.memberCount}`)
    .setColor("Red")
    .setTimestamp();

  client.channels.cache.get(settings.channels.logging.events.guildMemberRemove).send({ embeds: [embed] });
});

client.on("levelUp", async (levelEvent) => {
  const { newLevel, member: levelMember } = levelEvent;
  const { UserID, GuildID } = levelMember;

  client.guilds.cache.get(GuildID).channels.cache.get(settings.channels.systems.levelUp).send(`🎉 <@${UserID}> leveled up to level ${newLevel}! 🎉`);

  // Add level roles on level up
  const levelRolePairs = Object.entries(settings.roles.systems.levelRoles);
  for (const levelRolePair of levelRolePairs) {
    const levelValue = levelRolePair[0];
    const roleID = levelRolePair[1];
    if (levelValue <= newLevel) {
      (await client.guilds.cache.get(GuildID).members.fetch(UserID)).roles.add(roleID);
    }
  }
});

client.on("levelDown", async (levelEvent) => {
  const { newLevel, member: levelMember } = levelEvent;
  const { UserID, GuildID } = levelMember;

  // Remove level roles on level down
  const levelRolePairs = Object.entries(settings.roles.systems.levelRoles);
  for (const levelRolePair of levelRolePairs) {
    const levelValue = levelRolePair[0];
    const roleID = levelRolePair[1];
    if (levelValue > newLevel) {
      (await client.guilds.cache.get(GuildID).members.fetch(UserID)).roles.remove(roleID);
    }
  }
});

client.on("error", (error) => {
  console.error(`${new Date().toLocaleString("nl-NL", { timeZone: "CET" })}\nError: ${error.stack}`);
});
