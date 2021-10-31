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

socket.on("newPlayer", (playerData) => {
  $("body").append(
    `<p class="${playerData.playerId}">New player joined: ${playerData.name}</p>`
  );
});

socket.on("playerLeaving", (playerData) => {
  console.log(`-- Player ID is ${playerData.playerId}`);
  $(`p.${playerData.playerId}`).remove();
});
