let mongoose = require("mongoose");
let Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

let playerSchema = Schema({
  playerId: { type: String },
  socketId: { type: String },
  gamePin: { type: String },
  name: { type: String },
  hostId: { type: String },
  score: { type: Number, default: 0 },
});

player = mongoose.model("Player", playerSchema);

exports.playerModel = player;
