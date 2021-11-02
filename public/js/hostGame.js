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
  $(".game-info .game-title").html(`Quiz: ${game.title}`);
  $(".game-info .game-pin").html(`PIN: ${game.gamePin}`);
});

$("#go-live-btn").click(function () {
  let hostData = UrlParameters.getAllUrlParameters();
  hostData.hostId = getHostId();
  hostData.socketId = socket.id;
  socket.emit("goLive", hostData);
});
