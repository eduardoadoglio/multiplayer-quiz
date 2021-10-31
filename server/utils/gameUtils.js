const models = require("../../models");
const gameModel = models.gameModel;
const questionModel = models.questionModel;
const answerModel = models.answerModel;

class GameUtils {
  static getGameModelFromMap(gameData) {
    return new gameModel({
      gamePin: this.generateGamePin(),
      hostId: gameData.hostId,
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
    gameData.questions.forEach(function (question) {
      questions.push(
        new questionModel({
          title: question.title,
          answers: GameUtils._getAnswersFromQuestion(question),
        })
      );
    });
    return questions;
  }

  static _getAnswersFromQuestion(question) {
    let answers = [];
    question.answers.forEach(function (answer) {
      answers.push(
        new answerModel({
          title: answer.title,
          correct: answer.correct,
        })
      );
    });
    return answers;
  }

  static async getAllGamesFromHost(hostId) {
    let games = await gameModel.find({ hostId: hostId }).exec();
    return games;
  }
}

module.exports = GameUtils;
