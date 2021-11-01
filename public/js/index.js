$(document).ready(function () {
  let modalId = localStorage.getItem("openModal");
  modalId = "#no-games-found";
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

$("#close-modal").click(function () {
  $(this).parent().css("display", "none");
  $(this).parent().css("top", "-10%");
});
