const models = require("../../models");
const gameModel = models.gameModel;
const questionModel = models.questionModel;
const answerModel = models.answerModel;

class GameUtils {
  static getGameModelFromMap(gameData) {
    return new gameModel({
      gamePin: this.generateGamePin(),
      hostId: gameData.hostId,
      title: gameData.title,
      isLive: false,
      questions: this._getQuestionsFromGameData(gameData),
      currentQuestion: this._getCurrentQuestionFromGameData(gameData),
    });
  }
  static generateGamePin() {
    // Pin generation function where we create a random number between 0 and 1 and cast it into
    // a base36 string, which only contains a-z 0-9 characters. Then we remove some characters to
    // reduce it to 5 characters and making it upperCase.
    return Math.random().toString(36).substring(2, 7).toUpperCase();
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

  static async gameExists(gamePin) {
    gamePin = gamePin.toUpperCase();
    let game = await gameModel.findOne({ gamePin: gamePin }).exec();
    return game != null;
  }

  static async getGameFromPin(gamePin) {
    gamePin = gamePin.toUpperCase();
    let game = await gameModel.findOne({ gamePin: gamePin }).exec();
    return game;
  }

  static async startGame(gamePin) {
    let gameWithTimers = await GameUtils.startTimers(gamePin);
    return await gameModel.findOneAndUpdate(
      { gamePin: gamePin },
      { isLive: true },
      { new: true }
    );
  }

  static async startTimers(gamePin) {
    let game = await GameUtils.getGameFromPin(gamePin);
    let setExpression = GameUtils._generateStartTimersSetExpression(game);
    return await gameModel.findOneAndUpdate(
      { gamePin: gamePin },
      { $set: setExpression }
    );
  }

  static _generateStartTimersSetExpression(game) {
    let setExpression = {};
    let currentTime = Date.now();
    let thirtySecondsInMilisseconds = 30 * 1000;
    setExpression["currentQuestion.startAt"] = currentTime;
    setExpression["currentQuestion.endAt"] =
      currentTime + thirtySecondsInMilisseconds;
    game.questions.forEach(function (_, i) {
      setExpression[`questions.${i}.startAt`] =
        currentTime + i * thirtySecondsInMilisseconds;
      setExpression[`questions.${i}.endAt`] =
        currentTime + (i + 1) * thirtySecondsInMilisseconds;
    });
    return setExpression;
  }
}

module.exports = GameUtils;
