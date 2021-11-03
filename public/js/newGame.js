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
  let title = getTitleFromDOM();
  let questions = getQuestionsFromDOM();
  return {
    hostId: hostId,
    title: title,
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

function getTitleFromDOM() {
  return $("#title").val();
}

function getQuestionsFromDOM() {
  let questions = [];
  $(".questions .question").each(function (i, question) {
    let questionTitle = $(this).find(".question-title #question").val();
    let answers = getAnswersFromQuestion(question);
    questions.push({
      title: questionTitle,
      answers: answers,
      questionNumber: i,
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
