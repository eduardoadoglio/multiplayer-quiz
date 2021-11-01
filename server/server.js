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
    console.log("-- New game was created");
    console.log(`---- gameData: ${JSON.stringify(gameData)}`);
    let newGame = GameUtils.getGameModelFromMap(gameData);
    newGame.save();
    console.log(`-- Saved to database`);
    console.log(`---- ${newGame}`);
  });

  socket.on("newPlayer", async (playerData) => {
    let newPlayer = PlayerUtils.getPlayerModelFromMap(playerData);
    GameUtils.gameExists(newPlayer.gamePin).then((gameExists) => {
      if (gameExists) {
        newPlayer.save();
        io.to(playerData.gamePin).emit("newPlayer", playerData);
        socket.join(playerData.gamePin);
      } else {
        console.log(`Game ${newPlayer.gamePin} doesn't exist!`);
        socket.emit("noGameFound");
      }
    });
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
});
