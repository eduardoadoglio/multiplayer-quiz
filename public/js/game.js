import UrlParameters from "../utils/urlParameters.js";
import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();
let shouldShowLeaderBoard = true;
let shouldShowNextQuestion = false;

socket.on("connect", function () {
  let playerData = getCurrentPlayer();
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

socket.on("showLeaderBoard", (playerRanking) => {
  // For some reason splicing the array makes it out of order, so
  // this is a quick solution
  let podium = getPodium(playerRanking);
  let getRankingAfterPodium = getPlayersAfterPodium(playerRanking);
  $(".quiz").css("display", "none");
  $(".leaderboard").css("display", "flex");
  podium.forEach(function (player, i) {
    let position = i + 1;
    $(`.leaderboard #${position}`).append(`
      <div class="podium-player-card" id="${player.playerId}"> 
        <div class="player-name"> ${position}. ${player.name} </div>
        <div class="player-score">Pontuação: ${player.score}</div>
      </div>
    `);
  });
  getRankingAfterPodium.forEach(function (player, i) {
    $(".remaining-players").append(`
        <div class="player-card" id="${player.playerId}"> 
            <div class="player-name"> ${i + 4}. ${player.name} </div>
            <div class="player-score">${player.score} </div>
        </div>
    `);
  });
  resetProgressBar();
  shouldShowNextQuestion = true;
});

function getPodium(playerRanking) {
  let podium = [];
  playerRanking.forEach(function (player, i) {
    if (i >= 3) return false;
    podium.push(player);
  });
  return podium;
}

function getPlayersAfterPodium(playerRanking) {
  let players = [];
  playerRanking.forEach(function (player, i) {
    if (i < 3) return;
    players.push(player);
  });
  return players;
}

function resetProgressBar() {
  $(".time-remaining div").removeClass("progress-bar");
  setTimeout(function () {
    $(".time-remaining div").addClass("progress-bar");
  }, 10);
}

setInterval(function () {
  if (!$(".time-info").is(":visible")) return;
  let currentTime = Date.now();
  let currentGame = getCurrentGame();
  let currentQuestion = currentGame.currentQuestion;
  let timeLeft = 0;
  if (shouldShowLeaderBoard) {
    timeLeft = (currentQuestion.endAt - currentTime) / 1000;
    if (timeLeft <= 0) {
      timeLeft = 0;
      shouldShowLeaderBoard = false;
    }
  } else if (shouldShowNextQuestion) {
    let lastQuestionEndedAt = currentQuestion.endAt;
    timeLeft = 30 - (currentTime - lastQuestionEndedAt) / 1000;
    if (timeLeft <= 0) {
      timeLeft = 0;
      shouldShowNextQuestion = false;
    }
  }
  $(".seconds-left").html(Math.trunc(timeLeft));
}, 100);

function setCurrentProgress() {
  let currentProgress =
    ($(".progress-bar").width() / $(".progress-bar").parent().width()) * 100;
  let secondsLeft = Math.ceil((30 * currentProgress) / 100);
  $(".seconds-left").html(secondsLeft);
}

$(document).ready(function () {
  setCurrentProgress();
  let game = getCurrentGame();
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
  let currentGame = getCurrentGame();
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

function getCurrentGame() {
  return JSON.parse(localStorage.getItem("currentGame"));
}

function getCurrentPlayer() {
  return JSON.parse(localStorage.getItem("currentPlayer"));
}

function getScoreIncrease() {
  // Eventually base score off time remaining when answered
  return 1;
}
