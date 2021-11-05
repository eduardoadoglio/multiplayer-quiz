import UrlParameters from "../utils/urlParameters.js";
import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();

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

socket.on("startGame", (game) => {});

setInterval(function () {
  if (!$(".time-info").is(":visible") || $(".game-over").is(":visible")) return;
  let currentTime = Date.now();
  let currentGame = getCurrentGame();
  let currentQuestion = currentGame.currentQuestion;
  let isShowingLeaderBoard = $(".leaderboard").is(":visible");
  let isShowingQuestion = $(".quiz").is(":visible");
  let timeLeft = 0;
  if (isShowingLeaderBoard) {
    timeLeft = 30 - (currentTime - currentQuestion.endAt) / 1000;
  } else if (isShowingQuestion) {
    timeLeft = (currentQuestion.endAt - currentTime) / 1000;
  }
  if (timeLeft <= 0) {
    timeLeft = 0;
  }
  $(".seconds-left").html(Math.trunc(timeLeft));
}, 100);

socket.on("nextQuestion", (game) => {
  localStorage.setItem("currentGame", JSON.stringify(game));
  if (game.currentQuestion == null) {
    $(".leaderboard").addClass("game-over");
    $(".timer-info").css("display", "none");
    $(".quiz").css("display", "none");
    $(".leaderboard").css("display", "flex");
    return;
  }
  $(".leaderboard").empty();
  $(".leaderboard").css("display", "none");
  $(".quiz").css("display", "flex");
  let currentQuestion = game.currentQuestion;
  let currentAnswers = currentQuestion.answers;
  $(".quiz-header .question-title").html(currentQuestion.title);
  $(".quiz-body .alternatives").empty();
  let icons = [
    "fas fa-circle",
    "fab fa-ethereum",
    "fas fa-heart",
    "fas fa-square",
  ];
  currentAnswers.forEach(function (answer, i) {
    let row = i < 2 ? "first-row" : "second-row";
    $(`.quiz-body .alternatives .${row}`).append(`
      <div class="alternative-card" data-answer-number="${i}">
        <div class="alternative-icon">
          <i class="${icons[i]}"></i>
        </div>
        <div class="alternative alternative-text"> ${answer.title} </div>
      </div>
    `);
  });
  resetProgressBar();
});

socket.on("showLeaderBoard", (playerRanking) => {
  $(".quiz").css("display", "none");
  $(".leaderboard").css("display", "flex");
  // For some reason splicing the array makes it out of order, so
  // this is a quick solution
  let podium = getPodium(playerRanking);
  let getRankingAfterPodium = getPlayersAfterPodium(playerRanking);
  $(".quiz").css("display", "none");
  $(".leaderboard").css("display", "flex");
  podium.forEach(function (player, i) {
    let position = i + 1;
    $(`.leaderboard #${position}`).empty();
    $(`.leaderboard #${position}`).append(`
      <div class="podium-player-card" id="${player.playerId}">
        <div class="player-info">
          <div class="player-rank">${position}.</div>
          <div class="player-name">  ${player.name} </div>
        </div>
        <div class="player-score">${player.score}</div>
      </div>
    `);
  });
  $(".remaining-players").empty();
  getRankingAfterPodium.forEach(function (player, i) {
    $(".remaining-players").append(`
        <div class="player-card" id="${player.playerId}"> 
          <div class="player-info">
            <div class="player-rank">${i + 4}. </div>
            <div class="player-name">  ${player.name} </div>
          </div>
          <div class="player-score">${player.score} </div>
        </div>
    `);
  });
  resetProgressBar();
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
  }, 300);
}

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
  $(".players-info").css("display", "none");
  $(".game-info").css("display", "none");
  $(".quiz").css("display", "flex");
  $(".time-info").css("display", "flex");

  localStorage.setItem("currentGame", JSON.stringify(game));

  let currentQuestion = game.currentQuestion;
  let currentAnswers = currentQuestion.answers;
  $(".quiz-header .question-title").html(currentQuestion.title);
  let icons = [
    "fas fa-circle",
    "fab fa-ethereum",
    "fas fa-heart",
    "fas fa-square",
  ];
  currentAnswers.forEach(function (answer, i) {
    let row = i < 2 ? "first-row" : "second-row";
    $(`.quiz-body .alternatives .${row}`).append(`
      <div class="alternative-card" data-answer-number="${i}">
        <div class="alternative-icon">
          <i class="${icons[i]}"></i>
        </div>
        <div class="alternative alternative-text"> ${answer.title} </div>
      </div>
    `);
  });
});

$(".alternatives").on("click", ".alternative-card", function () {
  if ($(this).hasClass("disabled")) return;
  let currentGame = getCurrentGame();
  let currentAnswers = currentGame.currentQuestion.answers;
  let correct = currentAnswers[$(this).data("answer-number")].correct;
  let answerData = {
    playerId: getPlayerId(),
    socketId: socket.id,
    correct: correct,
    scoreIncrease: getScoreIncrease(),
  };
  $(".alternatives .alternative-card").not(this).addClass("disabled-effect");
  $(".alternatives .alternative-card").addClass("disabled");
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
