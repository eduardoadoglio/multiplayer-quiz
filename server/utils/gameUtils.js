const models = require("../../models");
const gameModel = models.gameModel;
const questionModel = models.questionModel;
const answerModel = models.answerModel;

class GameUtils {
  static getGameModelFromMap(gameData) {
    return new gameModel({
      gamePin: this.generateGamePin(),
      hostId: gameData["hostId"],
      isLive: false,
      questions: this._getQuestionsFromGameData(gameData),
      currentQuestion: this._getCurrentQuestionFromGameData(gameData),
    });
  }
  static generateGamePin() {
    return parseInt(Math.random() * (9999 - 1000) + 1000);
  }

  static _getCurrentQuestionFromGameData(gameData) {
    let questions = this._getQuestionsFromGameData(gameData);
    // On startup, current question will always be the first question
    return questions[0];
  }

  static _getQuestionsFromGameData(gameData) {
    let questions = [];
    for (let question in gameData["questions"]) {
      questions.push(
        new questionModel({
          title: question["title"],
          answers: this._getAnswersFromQuestion(question),
        })
      );
    }
    return questions;
  }

  static _getAnswersFromQuestion(question) {
    let answers = [];
    for (let answer in question["answers"]) {
      answers.push(
        new answerModel({
          title: answer["title"],
          correct: answer["correct"],
        })
      );
    }
    return answers;
  }
}

module.exports = GameUtils;
