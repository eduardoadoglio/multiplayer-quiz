import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();

socket.on("connect", function () {
  let hostData = {
    hostId: getHostId(),
    socketId: socket.id,
  };
  socket.emit("listGames", hostData);
});

function getHostId() {
  let hostId = CookieUtils.getCookie("userId");
  if (hostId == undefined) {
    hostId = UuidUtils.getUuid4();
    CookieUtils.setCookie("userId", hostId);
  }
  return hostId;
}

socket.on("listGames", (games) => {
  if (games == undefined || games.length <= 0) {
    $(".no-games").css("display", "flex");
    return;
  }
  $(".games").empty();
  games.forEach(function (game, i) {
    let gamePin = game.gamePin.toUpperCase();
    let gameTitle = game.title;
    $(".games").append(
      `<div class="game-card" data-pin="${gamePin}">
        <div class="game-title">${gameTitle}</div>
        <hr>
        <div class="game-pin">${gamePin}</div>
      </div>`
    );
  });
});

$(".games").on("click", ".game-card", function () {
  let gamePin = $(this).data("pin");
  window.location.href = `../host/index.html?gamePin=${gamePin}`;
});
