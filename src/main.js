const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { readdirSync } = require('fs');
const { version } = require('../package.json');
require('dotenv').config();

// Initiating client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.MessageContent],
  presence: { activities: [{ name: `on ${version}`, type: ActivityType.Playing }] },
});

// Creating collections
client.commands = new Collection();
client.buttons = new Collection();

// Call handler files
readdirSync('./src/structures/handlers').forEach((file) => require(`./structures/handlers/${file}`).execute(client));

client.login(process.env.tokenDev);
