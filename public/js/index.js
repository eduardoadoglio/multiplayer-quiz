$(document).ready(function () {
  let modalId = localStorage.getItem("openModal");
  if (modalId) {
    $(modalId).css("display", "flex");
    $(modalId).animate(
      {
        top: "10%",
      },
      750,
      function () {}
    );
    localStorage.removeItem("openModal");
  }
});

$(".close-modal").click(function () {
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

particlesJS.load("particles-js", "../assets/particles/particles.json");
