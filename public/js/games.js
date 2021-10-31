import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();

socket.on("connect", function () {
  let hostData = {
    hostId: getHostId(),
    socketId: socket.id,
  };
  console.log(`---- Listing games for ${hostData.hostId}`);
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
  console.log(`-- GAMES: ${JSON.stringify(games)}`);
  if (games == undefined || games.length <= 0) {
    return;
  }
  $(".games").empty();
  games.forEach(function (game, i) {
    console.log(`---- GAME ${i}: ${game}`);
    $(".games").append(
      `<p> Jogo ${i} <br> ${game.questions[0].title} <br> PIN: ${game.gamePin} </p>`
    );
  });
});
