import UrlParameters from "../utils/urlParameters.js";
import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();
let shouldShowLeaderBoard = true;
let shouldShowNextQuestion = false;

socket.on("connect", function () {
  let hostData = UrlParameters.getAllUrlParameters();
  if (hostData.gamePin == undefined) {
    window.location.href = "../games/";
  }
  hostData.hostId = getHostId();
  hostData.socketId = socket.id;
  console.log(`-- Host data is ${JSON.stringify(hostData)}`);
  socket.emit("hostJoin", hostData);
});

socket.on("disconnect", function () {
  let hostData = UrlParameters.getAllUrlParameters();
  hostData.hostId = getHostId();
  hostData.socketId = socket.id;
  socket.emit("hostDisconnect", hostData);
});

function getHostId() {
  let hostId = CookieUtils.getCookie("userId");
  if (hostId == undefined) {
    hostId = UuidUtils.getUuid4();
    CookieUtils.setCookie("userId", hostId);
  }
  return hostId;
}

socket.on("newPlayer", (playerData) => {
  console.log("-- Received newPlayer on host");
  $(".players").append(`
    <div class="player-card" id="${playerData.socketId}">
        ${playerData.name}
    </div>
    `);
});

socket.on("playerLeaving", (playerData) => {
  console.log(`-- Player ${playerData.playerId} just left`);
  $(`#${playerData.socketId}`).remove();
});

socket.on("listPlayers", (players) => {
  $(".players").empty();
  players.forEach(function (player, _) {
    $(".players").append(
      `<div class="player-card" id="${player.socketId}">${player.name}</div>`
    );
  });
});

socket.on("gameInfo", (game) => {
  $(".game-info .game-title").html(`Quiz: ${game.title}`);
  $(".game-info .game-pin").html(`PIN: ${game.gamePin}`);
});

$("#go-live-btn").click(function () {
  let hostData = UrlParameters.getAllUrlParameters();
  hostData.hostId = getHostId();
  hostData.socketId = socket.id;
  socket.emit("goLive", hostData);
});

socket.on("startGame", (game) => {
  $(".players-info").css("display", "none");
  $(".quiz").css("display", "flex");
  $(".time-info").css("display", "flex");

  localStorage.setItem("currentGame", JSON.stringify(game));

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
      socket.emit("showLeaderBoard", currentGame);
    }
  } else if (shouldShowNextQuestion) {
    let lastQuestionEndedAt = currentQuestion.endAt;
    timeLeft = 30 - (currentTime - lastQuestionEndedAt) / 1000;
    if (timeLeft <= 0) {
      timeLeft = 0;
      shouldShowNextQuestion = false;
      socket.emit("nextQuestion", currentGame);
    }
  }
  $(".seconds-left").html(Math.trunc(timeLeft));
}, 100);

function getCurrentGame() {
  return JSON.parse(localStorage.getItem("currentGame"));
}

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
  $(".remaining-players").empty();
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
