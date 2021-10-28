let socket = io();

function createGame() {
  gameData = {
    questions: [
      {
        title: "pergunta",
        answers: [
          {
            title: "resposta",
            correct: true,
          },
        ],
      },
    ],
  };
  socket.emit("newGame", gameData);
  window.location.href = "../";
}
