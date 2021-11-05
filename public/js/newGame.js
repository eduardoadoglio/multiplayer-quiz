import CookieUtils from "../utils/CookieUtils.js";
import UuidUtils from "../utils/UuidUtils.js";
let socket = io();
let emptyQuestion = $(".questions").html();

$(".questions").on("click", "#right-alternative", function () {
  let alternatives = $(this).closest(".alternatives");
  let alternativeCards = $(alternatives).find(".alternative-card");
  alternativeCards.each(function (i, alternativeCard) {
    let checkBox = $(alternativeCard).find("#right-alternative");
    if (checkBox.is(":checked")) {
      checkBox.prop("checked", false);
    }
  });
  $(this).prop("checked", true);
});

$("#new-question-btn").click(function () {
  $(".questions").append(emptyQuestion);
});

$("#create-game-btn").click(function () {
  try {
    let gameData = getGameData();
    validateForm();
    socket.emit("newGame", gameData);
    window.location.href = "../";
  } catch (e) {
    showModal(e.message);
  }
});

function showModal(text) {
  $("#error-modal").css("display", "flex");
  $(".modal-content").html(text);
  $("#error-modal").animate(
    {
      top: "10%",
    },
    750,
    function () {}
  );
}

$("#close-modal").click(function () {
  $(this)
    .parent()
    .animate(
      {
        top: "-10%",
      },
      750,
      function () {
        $(this).css("display", "none");
      }
    );
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
    let questionTitle = $(this).find(".game-input.regular #question").val();
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
    .find(".question-alternative")
    .each(function (_, obj) {
      let answerTitle = $(this).find("#alternative").val();
      let correctAnswer = $(this).find("#right-alternative").prop("checked");
      answers.push({
        title: answerTitle,
        correct: correctAnswer,
      });
    });
  return answers;
}

function validateForm() {
  validateQuizTitle();
  validateQuestions();
}

function validateQuizTitle() {
  if (!$("#title").val())
    throw Error("O título do seu quiz é um campo obrigatório");
}

function validateQuestions() {
  let questions = $(".questions");
  questions.each(function (i, question) {
    validateQuestionTitle(question);
    validateQuestionAlternatives(question);
  });
}

function validateQuestionTitle(question) {
  if (!$(question).find("#question").val())
    throw Error("O título da pergunta é um campo obrigatório");
}

function validateQuestionAlternatives(question) {
  let alternatives = $(question).find(".alternatives .alternative-card");
  validateAlternativesCheckbox(alternatives);
  alternatives.each(function (i, alternative) {
    validateAlternativeText(alternative);
  });
}

function validateAlternativesCheckbox(alternatives) {
  let checkBoxes = $(alternatives).find("#right-alternative");
  let hasOneChecked = false;
  checkBoxes.each(function (i, checkBox) {
    if ($(checkBox).is(":checked")) {
      hasOneChecked = true;
    }
  });
  if (!hasOneChecked)
    throw Error("Todas as questões devem conter uma alternativa correta");
}

function validateAlternativeText(alternative) {
  if (!$(alternative).find("#alternative").val())
    throw Error("Todas as alternativas devem conter texto");
}
