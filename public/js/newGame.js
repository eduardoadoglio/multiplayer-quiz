let socket = io();

function createGame() {
  gameData = getGameDataFromDOM();
  socket.emit("newGame", gameData);
  window.location.href = "../";
}

function getGameDataFromDOM() {
  let questions = getQuestionsFromDOM();
  return {
    questions: questions,
  };
}

function getQuestionsFromDOM() {
  let questions = [];
  $(".question").each(function (_, question) {
    let questionTitle = $(this).find(".question-title #question").val();
    console.log(`-- questionTitle = ${questionTitle}`);
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
    .each(function (_, _) {
      let answerTitle = $(this).find("#alternative").val();
      let correctAnswer = $(this).find("#right-answer").prop("checked");
      answers.push({
        title: answerTitle,
        correct: correctAnswer,
      });
    });
  return answers;
}
