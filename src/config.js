import dotenv from "dotenv";
dotenv.config();

export const bot = {
  application_id: "889157854966198313",
  guild_id: "928369763552464997",
};

export const settings = {
  commandCooldown: 3 * 1000,
  maxReasonLength: 500,
  version: "v4.0.0",
  emojis: {
    check: "<:scrappy_check:1029855559761002506>",
    cross: "<:scrappy_cross:1029847563437887620>",
    warning: "<:scrappy_warning:1029859720871292942>",
  },
  channels: {
    logging: {
      timeout: "1011022661926785125",
      warn: "1012018634291433582",
      blacklist: "1145304966131621988",
      filter_review: "1002548216941785118",
      ban: "1146410957153763358",
      kick: "1146530750229905480",
      purge: "928380278274138212",
    },
    systems: {
      mysteryMerchant: "934508100025737246",
    },
  },
  roles: {
    systems: {
      verify: "1153341921171886200",
    },
  },
  appealServerInvite: "https://discord.gg/88qsZ36YFf",
};
