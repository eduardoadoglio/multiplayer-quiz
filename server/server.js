const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const publicPath = path.join(__dirname, "../public");

require("dotenv").config();

const tcpPort = process.env.TCP_PORT;
const tcpIP = process.env.TCP_IP;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

server.listen(3000, () => {
  console.log("Server started on port 3000");
});

io.on("connection", (socket) => {
  console.log("-- User connected");
  socket.on("disconnect", () => {
    console.log("-- User disconnected");
  });
});
