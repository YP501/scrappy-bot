import { Schema, SchemaTypes, model } from "mongoose";

const infractionSchema = new Schema({
  type: {
    type: SchemaTypes.String,
    required: true,
  },
  targetUser_id: {
    type: SchemaTypes.String,
    required: true,
  },
  moderatorUser_id: {
    type: SchemaTypes.String,
    required: true,
  },
  reason: {
    type: SchemaTypes.String,
    required: false,
    default: "No reason provided",
  },
  date: {
    type: SchemaTypes.String,
    required: true,
  },
  id: {
    type: SchemaTypes.String,
    required: true,
  },
});
export const Infraction = model("Infraction", infractionSchema);

const blacklistSchema = new Schema({
  targetUser_id: {
    type: SchemaTypes.String,
    required: true,
  },
});
export const Blacklist = model("Blacklist", blacklistSchema);

const banSchema = new Schema({
  targetUser_id: {
    type: SchemaTypes.String,
    required: true,
  },
  unbanTimestamp: {
    type: SchemaTypes.String,
    required: true,
    default: null,
  },
});
export const Ban = model("Ban", banSchema);
