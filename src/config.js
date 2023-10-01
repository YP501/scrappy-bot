import dotenv from "dotenv";
dotenv.config();

export const bot = {
  guild_id: "928369763552464997",
  application_id: "889157854966198313",
  version: "v4.0.0",
};

export const settings = {
  commandCooldown: 3 * 1000,
  maxReasonLength: 500,
  min_Xp: 15,
  max_Xp: 30,
  xpCooldown: 30 * 1000,
  emojis: {
    check: "<:scrappy_check:1029855559761002506>",
    cross: "<:scrappy_cross:1029847563437887620>",
    warning: "<:scrappy_warning:1029859720871292942>",
  },
  channels: {
    logging: {
      ban: "1146410957153763358",
      blacklist: "1145304966131621988",
      filter_review: "1002548216941785118",
      kick: "1146530750229905480",
      lock: "1158111972139745412", // same for unlock
      purge: "928380278274138212",
      timeout: "1011022661926785125",
      warn: "1012018634291433582",
    },
    systems: {
      mysteryMerchant: "934508100025737246",
      verify: "1001595866295058573",
      levels: "1157035021065007195",
    },
  },
  roles: {
    permissions: {
      ban: "954034783766327307",
      blacklist: "954034783766327307",
      infraction: "954034783766327307",
      kick: "954034783766327307",
      levels: "954034783766327307",
      lock: "954034783766327307", // same for unlock
      purge: "954034783766327307",
      timeout: "954034783766327307",
      warn: "954034783766327307",
    },
    systems: {
      verified: "1153341921171886200",
      mysteryMerchant: "954034783766327307",
      filterBypass: "954034783766327307",
      levels: {
        // You can add as many as you'd like, they just need to follow the format "level<number>: role_id<string>"
        5: "968222586871898162",
        10: "968222643385958440",
        15: "968223193347289140",
        20: "968223253128699975",
        25: "968223315711914085",
        30: "968223357684297759",
        40: "968223477289087067",
        50: "968223503700623410",
        75: "968223519924162610",
        100: "968223535942217828",
      },
    },
  },
  appealServerInvite: "https://discord.gg/88qsZ36YFf",
};
