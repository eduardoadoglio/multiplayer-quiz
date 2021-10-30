let mongoose = require("mongoose");
let Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

Answer = require("./answer").AnswerModel;

let answerSchema = Schema({
  title: { type: String },
  correct: { type: Boolean, default: false },
});

answer = mongoose.model("Answer", answerSchema);

exports.answerModel = answer;
