import UrlParameters from "../utils/urlParameters.js";
import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();

socket.on("connect", function () {
  let playerData = JSON.parse(localStorage.getItem("currentPlayer"));
  playerData.socketId = socket.id;
  if (!playerData) {
    playerData = UrlParameters.getAllUrlParameters();
    playerData.gamePin = JSON.parse(
      localStorage.getItem("currentGame")
    ).gamePin;
    playerData.playerId = getPlayerId();
    playerData.socketId = socket.id;
  }
  socket.emit("newPlayer", playerData);
});

socket.on("disconnect", function () {
  let playerData = UrlParameters.getAllUrlParameters();
  playerData.playerId = getPlayerId();
  playerData.socketId = socket.id;
  socket.emit("playerLeaving", playerData);
});

setInterval(function () {
  let currentProgress =
    ($(".progress-bar").width() / $(".progress-bar").parent().width()) * 100;
  let secondsLeft = Math.floor((30 * currentProgress) / 100);
  $(".seconds-left").html(secondsLeft);
}, 100);

function setCurrentProgress() {
  let currentProgress =
    ($(".progress-bar").width() / $(".progress-bar").parent().width()) * 100;
  let secondsLeft = Math.ceil((30 * currentProgress) / 100);
  $(".seconds-left").html(secondsLeft);
}

$(document).ready(function () {
  setCurrentProgress();
  let game = JSON.parse(localStorage.getItem("currentGame"));
  if (!game) {
    window.location.href = "../";
  }
  let currentQuestion = game.currentQuestion;
  let currentAnswers = currentQuestion.answers;
  $(".quiz-header .quiz-title").html(game.title);
  $(".quiz-header .question-title").html(currentQuestion.title);
  currentAnswers.forEach(function (answer, i) {
    $(".quiz-body .alternatives").append(`
        <div class="alternative" data-answer-number="${i}"> ${answer.title} </div>
    `);
  });
});

$(".alternatives").on("click", ".alternative", function () {
  let currentGame = JSON.parse(localStorage.getItem("currentGame"));
  let currentAnswers = currentGame.currentQuestion.answers;
  console.log(`Current answers: ${currentAnswers}`);
  console.log(`This answer is index ${$(this).data("answer-number")}`);
  let correct = currentAnswers[$(this).data("answer-number")].correct;
  let answerData = {
    playerId: getPlayerId(),
    socketId: socket.id,
    correct: correct,
    scoreIncrease: getScoreIncrease(),
  };
  socket.emit("quizAnswer", answerData);
});

function getPlayerId() {
  let playerId = CookieUtils.getCookie("userId");
  if (playerId == undefined) {
    playerId = UuidUtils.getUuid4();
    CookieUtils.setCookie("userId", playerId);
  }
  return playerId;
}

function getScoreIncrease() {
  // Eventually base score off time remaining when answered
  return 1;
}
