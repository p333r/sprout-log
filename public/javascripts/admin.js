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

async function deleteUser() {
  if (confirm("Are you sure you want to delete all selected users?")) {
    $(".form-check-input:checked").each(async function () {
      const username = $(this).attr("id");
      $(this).parent().remove();
      await fetch(`/users/${username}`, {
        method: "DELETE",
      });
    });
  }
}

function clock() {
  let d = new Date();
  let day = d.toLocaleString("en-US", {
    weekday: "long",
  });
  let date = d.toLocaleString("en-US", {
    dateStyle: "short",
  });
  let time = d.toLocaleString("en-US", {
    timeStyle: "short",
  });

  $("#day").text(day);
  $("#date").text(date);
  $("#clock").text(time);
}

$(function () {
  clock();
  setInterval(clock, 1000);
  $("#deleteSeedBtn").click(deleteSeed);
  $("#addSeedBtn").click(() => {
    $("#add-seed-form-container").slideDown("slow");
  });
  $("#deleteUserBtn").click(deleteUser);
  $(".form-check").click(function () {
    $(this)
      .children("input")
      .props("checked", !$(this).children("input").props("checked"));
  });
});
