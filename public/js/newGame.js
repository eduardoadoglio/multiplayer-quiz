import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();
let emptyQuestion = $(".questions").html();

$("#new-question-btn").click(function () {
  $(".questions").append(emptyQuestion);
});

$("#create-game-btn").click(function () {
  let gameData = getGameData();
  socket.emit("newGame", gameData);
  window.location.href = "../";
});

function getGameData() {
  let hostId = getHostId();
  let questions = getQuestionsFromDOM();
  return {
    hostId: hostId,
    questions: questions,
  };
}

function getHostId() {
  let hostId = CookieUtils.getCookie("userId");
  if (hostId == undefined) {
    hostId = UuidUtils.getUuid4();
    CookieUtils.setCookie("userId", hostId);
  }
  return hostId;
}

function getQuestionsFromDOM() {
  let questions = [];
  $(".questions .question").each(function (_, question) {
    let questionTitle = $(this).find(".question-title #question").val();
    let answers = getAnswersFromQuestion(question);
    questions.push({
      title: questionTitle,
      answers: answers,
    });
  });
  return questions;
}

function getAnswersFromQuestion(question) {
  let answers = [];
  $(question)
    .find(".question-answer")
    .each(function (_, obj) {
      let answerTitle = $(this).find("#alternative").val();
      let correctAnswer = $(this).find("#right-answer").prop("checked");
      answers.push({
        title: answerTitle,
        correct: correctAnswer,
      });
    });
  return answers;
}
