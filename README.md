# ⚠️ This repository is archived

This version of **scrappy-bot** has been **archived** and is no longer maintained.   
A complete rewrite of the bot is now available in C#:

👉 **New repository:** *https://github.com/YP501/Scrappy.NET*

---

# Welcome to scrappy-bot, FrankieFms' Discord bot! (Archived)

> Developed and maintained by [@YP501](https://github.com/YP501)  
> **This JavaScript/Bun version is archived and replaced by a new C# rewrite.**

This repository is kept public for transparency and for people who are interested in how the original version worked behind the scenes.

## Self-hosting (Archive Version)

> Self-hosting is allowed, although it is **not recommended** because this bot was focused on the FrankieFms Lounge server and contains several hardcoded values. Incorrect or missing configuration will prevent the bot from starting.

### Steps for self-hosting (legacy version):

1. Download the source code from the [latest release](https://github.com/YP501/scrappy-bot/releases/latest) and unzip it
2. Enter the newly extracted folder
3. Install dependencies with `bun install`  
   Install Bun if needed: https://bun.com/docs/installation
4. Add an `.env` file in the root folder with:
```env
token_dev = "your bot token here"
db_dev = "your mongo authentication uri here"
```
5. Edit the IDs and values inside `./src/config.js` to match your server
6. Run `bun start`
7. Hope for the best

## Notes

- You **may** self-host but **may not** impersonate Frankie's version of the bot.
- You **must** credit the original author when self-hosting this version.
- This bot was originally named **Helikopter Bot**, later renamed to **Scrappy Bot**.
- This repository has been **archived** in favor of a new C# rewrite.
- Limited help for this legacy version is available, but **no functionality is guaranteed** and issues may not be fixable due to its outdated architecture.
