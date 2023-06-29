async function deleteSeed() {
  if (confirm("Are you sure you want to delete all selected seeds?")) {
    $(".form-check-input:checked").each(async function () {
      const seedName = $(this).attr("id");
      $(this).parent().remove();
      await fetch(`/seeds/${seedName}`, {
        method: "DELETE",
      });
    });
  }
}

function clock() {
  let date = new Date();
  let day = date.toLocaleString("en-US", {
    weekday: "long",
  });
  let timeString = date.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  $("#clock").text(day + " " + timeString);
}

$(function () {
  clock();
  setInterval(clock, 1000);
  $("#deleteSeedBtn").click(deleteSeed);
});
