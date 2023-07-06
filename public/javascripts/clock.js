$(document).ready(function () {
  clock();
  setInterval(clock, 1000); // Update clock every second
});

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
