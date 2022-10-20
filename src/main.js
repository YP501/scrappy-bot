const { Client, Collection, ActivityType } = require('discord.js');
const { readdirSync } = require('fs');
const { intents } = require('./config.json');
const { version } = require('../package.json');
require('dotenv').config();

const client = new Client({ intents, presence: { activities: [{ name: `on ${version}`, type: ActivityType.Listening }] } });
client.commands = new Collection();
client.buttons = new Collection();

// Call handler files
readdirSync('./src/structures/handlers').forEach((file) => require(`./structures/handlers/${file}`).execute(client));

client.login(process.env.tokenDev);
