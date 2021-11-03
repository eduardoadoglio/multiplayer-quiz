const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const publicPath = path.join(__dirname, "../public");
const utils = require("./utils");
const GameUtils = require("./utils/gameUtils");

require("dotenv").config();

const tcpPort = process.env.TCP_PORT;
const tcpIP = process.env.TCP_IP;

// Server configuration
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

// DB configuration
let MongoClient = require("mongodb").MongoClient;
let mongoose = require("mongoose");
const PlayerUtils = require("./utils/playerUtils");
const mongoUrl = "mongodb://127.0.0.1:27017/quiz";

mongoose.connect(mongoUrl, { useNewUrlParser: true });

const db = mongoose.connection;

db.once("open", (_) => {
  console.log("-- Database connected");
});

db.on("error", (err) => {
  console.log(`-- Connection error: ${err}`);
});

app.use(express.static(publicPath));

server.listen(3000, () => {
  console.log("Server started on port 3000");
});

io.on("connection", (socket) => {
  let socketId = socket.id;
  console.log("-- User connected");
  console.log(`---- Socket ID is ${socketId}`);

  socket.on("newGame", (gameData) => {
    let newGame = GameUtils.getGameModelFromMap(gameData);
    newGame.save();
  });

  socket.on("newPlayer", async (playerData) => {
    let newPlayer = PlayerUtils.getPlayerModelFromMap(playerData);
    await PlayerUtils.removeOtherPlayersWithPlayerId(newPlayer.playerId);
    let gamePin = newPlayer.gamePin;
    let gameExists = await GameUtils.gameExists(gamePin);
    if (!gameExists) {
      console.log(`Game ${gamePin} doesn't exist!`);
      socket.emit("noGameFound");
      return;
    }
    newPlayer.save();
    io.to(gamePin).emit("newPlayer", playerData);
    let players = await PlayerUtils.getAllPlayersFromGame(gamePin);
    io.to(playerData.socketId).emit("listPlayers", players);
    socket.join(gamePin);
  });

  socket.on("disconnect", async function () {
    player = await PlayerUtils.getPlayerBySocketId(socket.id);
    if (player) {
      await PlayerUtils.removePlayerFromGames(socket.id);
      console.log(`-- Sending playerLeaving to game ${player.gamePin}`);
      io.to(player.gamePin).emit("playerLeaving", player);
    }
  });

  socket.on("listGames", async function (hostData) {
    let hostId = hostData.hostId;
    let games = await GameUtils.getAllGamesFromHost(hostId);
    io.to(hostData.socketId).emit("listGames", games);
  });

  socket.on("hostJoin", async function (hostData) {
    let gamePin = hostData.gamePin;
    let players = await PlayerUtils.getAllPlayersFromGame(gamePin);
    socket.join(gamePin);
    io.to(hostData.socketId).emit("listPlayers", players);
    let game = await GameUtils.getGameFromPin(gamePin);
    io.to(hostData.socketId).emit("gameInfo", game);
  });

  socket.on("listPlayers", async function (gameData) {
    let gamePin = gameData.gamePin;
    let players = await PlayerUtils.getAllPlayersFromGame(gamePin);
    io.to(gamePin).emit("listPlayers", players);
  });

  socket.on("goLive", async (hostData) => {
    let gamePin = hostData.gamePin;
    let game = await GameUtils.startGame(gamePin);
    io.to(gamePin).emit("startGame", game);
  });

  socket.on("quizAnswer", async (answerData) => {
    let correct = answerData.correct;
    if (correct) {
      let playerId = answerData.playerId;
      let scoreIncrease = answerData.scoreIncrease;
      await PlayerUtils.increasePlayerScore(playerId, scoreIncrease);
    }
  });

  socket.on("showLeaderBoard", async (gameData) => {
    let gamePin = gameData.gamePin;
    let playerRanking = await PlayerUtils.getLeaderBoardForGame(gamePin);
    io.to(gamePin).emit("showLeaderBoard", playerRanking);
  });

  socket.on("nextQuestion", async (gameData) => {
    console.log("-- Received nextQuestion");
    let gamePin = gameData.gamePin;
    let newGame = await GameUtils.goToNextQuestion(gameData);
    io.to(gamePin).emit("nextQuestion", newGame);
  });
});
