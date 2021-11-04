import UrlParameters from "../utils/urlParameters.js";
import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();

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
  $(".game-info .game-title").html(`${game.title}`);
  $(".game-info .game-pin").html(`${game.gamePin}`);
});

$("#go-live-btn").click(function () {
  let hostData = UrlParameters.getAllUrlParameters();
  hostData.hostId = getHostId();
  hostData.socketId = socket.id;
  socket.emit("goLive", hostData);
});

socket.on("startGame", (game) => {
  $(".players-info").css("display", "none");
  $(".game-info").css("display", "none");
  $(".quiz").css("display", "flex");
  $(".time-info").css("display", "flex");

  localStorage.setItem("currentGame", JSON.stringify(game));

  let currentQuestion = game.currentQuestion;
  let currentAnswers = currentQuestion.answers;
  console.log(`currentAnswers: ${JSON.stringify(currentAnswers)}`);
  $(".quiz-header .question-title").html(currentQuestion.title);
  let icons = ["circle", "ethereum", "heart", "square"];
  currentAnswers.forEach(function (answer, i) {
    console.log("Looping through answers");
    let row = i < 2 ? "first-row" : "second-row";
    $(`.quiz-body .alternatives .${row}`).append(`
      <div class="alternative-card" data-answer-number="${i}">
        <div class="alternative-icon">
          <i class="fas fa-${icons[i]}"></i>
        </div>
        <div class="alternative alternative-text"> ${answer.title} </div>
      </div>`);
  });
});

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
  if (isShowingQuestion && timeLeft == 0) {
    $(".quiz").css("display", "none");
    socket.emit("showLeaderBoard", currentGame);
  } else if (isShowingLeaderBoard && timeLeft === 0) {
    $(".leaderboard").css("display", "none");
    socket.emit("nextQuestion", currentGame);
  }

  $(".seconds-left").html(Math.trunc(timeLeft));
}, 100);

function getCurrentGame() {
  return JSON.parse(localStorage.getItem("currentGame"));
}

socket.on("nextQuestion", (game) => {
  localStorage.setItem("currentGame", JSON.stringify(game));
  if (game.currentQuestion == null) {
    $(".leaderboard").addClass("game-over");
    $(".timer-info").css("display", "none");
    $(".quiz").css("display", "none");
    $(".leaderboard").css("display", "flex");
    return;
  }
  $(".quiz").css("display", "flex");
  let currentQuestion = game.currentQuestion;
  let currentAnswers = currentQuestion.answers;
  $(".quiz-header .question-title").html(currentQuestion.title);
  $(".quiz-body .alternatives").empty();
  currentAnswers.forEach(function (answer, i) {
    $(".quiz-body .alternatives").append(`
        <div class="alternative" data-answer-number="${i}"> ${answer.title} </div>
    `);
  });
  resetProgressBar();
});

socket.on("showLeaderBoard", (playerRanking) => {
  $(".leaderboard").css("display", "flex");
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
  }, 100);
}
