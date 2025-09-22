# Welcome to scrappy-bot, FrankieFms' Discord bot!

> Developed and maintained by [@YP501](https://github.com/YP501)

This repository is made open source for the purpose of transparency and for people who are interested in how this bot works behind the scenes.

## Self-hosting

> Self-hosting is allowed, although it's not recommended because this bot is focused on the FrankieFms Lounge server and contains some hardcoded values. Therefore, it is likely to not work on other servers.
> If any of the fields/ values are not filled in or wrong, the bot won't start.

**Steps for self-hosting:**

1. Download the source code from the [latest release](https://github.com/YP501/scrappy-bot/releases/latest) and unzip it somewhere
2. Enter the folder you just unzipped
3. Install the node modules with `bun install` (install bun [here](https://bun.com/docs/installation) if you haven't already)
4. Add an `.env` file in the root folder with the following values:

```
token_dev = "your bot token here"
db_dev = "your mongo authentication uri here"
```

4. Tweak the id's and values in `./src/config.js` to match the ones of your server and preferences
5. Run `bun start`
6. Pray it works

## Notes

- You are allowed to self-host this bot but you are not allowed to impersonate this bot as Frankie's bot.
- You **MUST** credit the original author of this repository when self-hosting and **CANNOT** claim it as your own.
- This bot was previously named Helikopter Bot and was renamed to Scrappy Bot.
