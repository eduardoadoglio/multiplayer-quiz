let mongoose = require("mongoose");
let Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

let QuestionSchema = require("./question").questionModel.schema;

let gameSchema = Schema({
  gamePin: { type: Number },
  hostId: { type: String },
  isLive: { type: Boolean, default: false },
  currentQuestion: { type: QuestionSchema },
  questions: { type: [QuestionSchema] },
});

game = mongoose.model("Game", gameSchema);

exports.gameModel = game;
