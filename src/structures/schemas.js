import { Schema, SchemaTypes, model } from "mongoose";

const infractionSchema = new Schema({
  type: {
    type: SchemaTypes.String,
    required: true,
  },
  target: {
    type: SchemaTypes.String,
    required: true,
  },
  moderator: {
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
const Infraction = model("Infraction", infractionSchema);

export { Infraction };
