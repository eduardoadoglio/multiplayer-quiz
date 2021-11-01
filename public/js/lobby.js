import UrlParameters from "../utils/urlParameters.js";
import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();

socket.on("connect", function () {
  let playerData = UrlParameters.getAllUrlParameters();
  playerData.playerId = getPlayerId();
  playerData.socketId = socket.id;
  console.log(`-- Player data is ${JSON.stringify(playerData)}`);
  socket.emit("newPlayer", playerData);
});

socket.on("disconnect", function () {
  let playerData = UrlParameters.getAllUrlParameters();
  playerData.playerId = getPlayerId();
  playerData.socketId = socket.id;
  socket.emit("playerLeaving", playerData);
});

function getPlayerId() {
  let playerId = CookieUtils.getCookie("userId");
  if (playerId == undefined) {
    playerId = UuidUtils.getUuid4();
    CookieUtils.setCookie("userId", playerId);
  }
  return playerId;
}

socket.on("newPlayer", (player) => {
  $(".players").append(
    `<div class="player-card" id="${player.socketId}">${player.name}</div>`
  );
});

socket.on("playerLeaving", (playerData) => {
  $(`p.${playerData.playerId}`).remove();
});

socket.on("noGameFound", function () {
  localStorage.setItem("openModal", "#no-games-found");
  window.location.href = "../index.html";
});

socket.on("startGame", (game) => {
  localStorage.setItem("currentGame", JSON.stringify(game));
  window.location.href = "../game/";
});

socket.on("listPlayers", (players) => {
  console.log("-- Received listPlayers on lobby");
  $(".players").empty();
  players.forEach(function (player, _) {
    $(".players").append(
      `<div class="player-card" id="${player.socketId}">${player.name}</div>`
    );
  });
});
