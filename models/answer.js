let mongoose = require("mongoose");
let Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

let answerSchema = Schema({
  title: { type: String },
  correct: { type: Boolean, default: false },
});

answer = mongoose.model("Answer", answerSchema);

exports.answerModel = answer;
