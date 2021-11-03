let mongoose = require("mongoose");
let Schema = mongoose.Schema;

AnswerSchema = require("./answer").answerModel.schema;

let questionSchema = Schema({
  title: { type: String },
  answers: { type: [AnswerSchema] },
  startAt: { type: Number, default: 0 },
  endAt: { type: Number, default: 0 },
  questionNumber: { type: Number, default: 0 },
});

question = mongoose.model("Question", questionSchema);

exports.questionModel = question;
