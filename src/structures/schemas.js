import { Schema, SchemaTypes, model } from "mongoose";

const infractionSchema = new Schema({
  type: {
    type: SchemaTypes.String,
    default: null,
  },
  targetUser_id: {
    type: SchemaTypes.String,
    default: null,
  },
  moderatorUser_id: {
    type: SchemaTypes.String,
    default: null,
  },
  reason: {
    type: SchemaTypes.String,
    default: "No reason provided",
  },
  date: {
    type: SchemaTypes.String,
    default: null,
  },
  id: {
    type: SchemaTypes.String,
    default: null,
  },
});
export const Infraction = model("Infraction", infractionSchema);

const blacklistSchema = new Schema({
  targetUser_id: {
    type: SchemaTypes.String,
    default: null,
  },
});
export const Blacklist = model("Blacklist", blacklistSchema);

const banSchema = new Schema({
  targetUser_id: {
    type: SchemaTypes.String,
    default: null,
  },
  unbanTimestamp: {
    type: SchemaTypes.String,
    default: null,
  },
});
export const Ban = model("Ban", banSchema);

const whitelistSchema = new Schema({
  url: {
    type: SchemaTypes.String,
    default: null,
  },
});
export const Whitelist = model("Whitelist", whitelistSchema);
