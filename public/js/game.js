import UrlParameters from "../utils/urlParameters.js";
import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();

setInterval(function () {
  let currentProgress =
    ($(".progress-bar").width() / $(".progress-bar").parent().width()) * 100;
  let secondsLeft = Math.floor((30 * currentProgress) / 100);
  $(".seconds-left").html(secondsLeft);
}, 100);

function setCurrentProgress() {
  let currentProgress =
    ($(".progress-bar").width() / $(".progress-bar").parent().width()) * 100;
  let secondsLeft = Math.ceil((30 * currentProgress) / 100);
  $(".seconds-left").html(secondsLeft);
}

$(document).ready(function () {
  setCurrentProgress();
  let game = JSON.parse(localStorage.getItem("currentGame"));
  if (!game) {
    window.location.href = "../";
  }
  let questions = game.questions;
  let currentQuestion = game.currentQuestion;
  let currentAnswers = currentQuestion.answers;
  $(".quiz-header .quiz-title").html(game.title);
  $(".quiz-header .question-title").html(currentQuestion.title);
  currentAnswers.forEach(function (answer, i) {
    $(".quiz-body .alternatives").append(`
        <div class="alternative" data-correct="${answer.correct}"> ${answer.title} </div>
    `);
  });
});

socket.on("connect", function () {});
