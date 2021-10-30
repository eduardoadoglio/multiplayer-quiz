let mongoose = require("mongoose");
let Schema = mongoose.Schema;

AnswerSchema = require("./answer").answerModel.schema;

let questionSchema = Schema({
  title: { type: String },
  answers: { type: [AnswerSchema] },
});

question = mongoose.model("Question", questionSchema);

exports.questionModel = question;
