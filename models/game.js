let mongoose = require("mongoose");
let Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

let QuestionSchema = require("./question").questionModel.schema;

let gameSchema = Schema({
  gamePin: { type: String },
  hostId: { type: String },
  isLive: { type: Boolean, default: false },
  currentQuestion: { type: QuestionSchema },
  questions: { type: [QuestionSchema] },
});

gameSchema.query.byHostId = function (hostId) {
  return this.where({ hostId: hostId });
};

game = mongoose.model("Game", gameSchema);

exports.gameModel = game;
