class Jar {
  growduration;
  constructor(id) {
    this.id = id;
    this.empty = true;
    this.seed = "";
    this.fillTime = "";
    this.wateringLog = [];
    this.growDuration = "";
  }
  fill(seed) {
    this.empty = false;
    this.seed = seed;
    this.fillTime = getTime();
  }
  water() {
    this.wateringLog.push(getTime());
  }
  clear() {
    this.empty = true;
    this.seed = "";
    this.fillTime = "";
    this.wateringLog = [];
    this.growDuration = "";
  }
}

let alertCount = 0;
const jarArray = [];
const msIn24h = 86400000;
const msIn12h = msIn24h / 2;
const seedArray = [];
let jarId; // Used in fillJar()
$(async function () {
  clock();
  setInterval(clock, 1000);
  await getSeeds();
  await checkDatabase();
  addSeedButtons();
  growDuration();
  checkWaterTime();
  setInterval(checkWaterTime, 600000);
  setInterval(growDuration, 18000);
  $("button:contains('Add seed')").click(showSeedButtons);
  $("button:contains('Water')").click(waterJar);
  $("button:contains('Empty')").click(emptyJar);
  $("button:contains('Add jar')").click(addJar);
  $("button.btn-close").click(removeJar);
  $("#seed-buttons input").click(seedInfo);
  $("#add-seed").click(fillJar);
  $("#hide-seeds").click(function () {
    $("#seed-container").slideUp();
  });
});

async function getSeeds() {
  const response = await fetch("/seeds");
  const data = await response.json();
  seedArray.push(...data);
  return;
}

async function getJars() {
  const response = await fetch("/user/jars");
  const data = await response.json();
  return data;
}

async function saveJars() {
  await fetch("/user/jars", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jarArray),
  });
  return;
}

function addJar() {
  let highestJarId;
  if (jarArray.length > 0) {
    highestJarId = parseInt(jarArray[jarArray.length - 1].id.match(/\d+/));
  } else {
    highestJarId = 0;
  }
  let jar = new Jar("jar" + (highestJarId + 1));
  jarArray.push(jar);
  saveJars(); // Save jarArray to database
  let jarHeading = "Jar " + jar.id.match(/\d+/);
  let jarHtml = `
  <div id="${jar.id}" class="card p-3 jar">
  <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-2"
    aria-label="Close">
  </button>
  <h2>${jarHeading}</h2>
  <progress class="jar-progress" value="0" max="100"></progress>
  <h3 class="fs-1">(empty)</h3>
  <h4></h4>
  <table class="table-responsive m-2">
    <tr>
      <td>Started:</td>
      <td></td>
    </tr>
    <tr>
      <td>Watered:</td>
      <td></td>
    </tr>
    <tr>
      <td>Grow time:</td>
      <td></td>
    </tr>
  </table>
  <div class="btn-group-round">
    <button type="button" class="btn btn-success m-1">Add seed</button>
    <button type="button" class="btn btn-primary m-1">Water</button>
    <button type="button" class="btn btn-danger m-1">Empty</button>
  </div>
</div>
`;
  $("#jar-container").append(jarHtml);
  $("#" + jar.id + " button.btn-close").click(removeJar);
  $("#" + jar.id + " button:contains('Add seed')").click(showSeedButtons);
  $("#" + jar.id + " button:contains('Water')").click(waterJar);
  $("#" + jar.id + " button:contains('Empty')").click(emptyJar);
}

function jarProgress() {}

function showSeedButtons() {
  $("#seed-container").slideDown();
  jarId = $(this).parent().parent("div").attr("id"); // Get jar id and store in global variable
  const jarName = $(this).parent().parent("div").children("h2").text();
  $("#seed-container h3").text("Add seed to " + jarName);
}

function removeJar() {
  let id = $(this).parent("div").attr("id");
  let jar = jarArray.find((item) => item.id === id);
  if (jar.empty === false) {
    if (
      confirm(`Are you sure you want to remove ${id} with all its contents?`)
    ) {
      let index = jarArray.indexOf(jar);
      jarArray.splice(index, 1);
      $("#" + id).remove();
      saveJars(); // Save jarArray to database
    }
  } else {
    let index = jarArray.indexOf(jar);
    jarArray.splice(index, 1);
    $("#" + id).remove();
    saveJars(); // Save jarArray to database
  }
}

async function checkDatabase() {
  const arr = await getJars();
  arr.forEach(function (item) {
    jarArray.push(new Jar(item.id));
    jarArray[jarArray.length - 1].empty = item.empty;
    jarArray[jarArray.length - 1].seed = item.seed;
    jarArray[jarArray.length - 1].fillTime = item.fillTime;
    jarArray[jarArray.length - 1].wateringLog = item.wateringLog;
    jarArray[jarArray.length - 1].growDuration = item.growDuration;
  });
  jarArray.forEach((item) => {
    let jarHeading =
      item.id.slice(0, 1).toUpperCase() +
      item.id.slice(1, 3) +
      " " +
      item.id.slice(3);
    if (item.empty === false) {
      $("#" + item.id + " h4").html(
        `Growing for <span class="days-text">${item.growDuration}</span>`
      );
    }
    let jarHtml = `
      <div id="${item.id}" class="card p-3 jar">
      <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-2"
        aria-label="Close">
      </button>
      <h2>${jarHeading}</h2>
      <progress class="jar-progress" value="0" max="100"></progress>
      <h3 class="fs-1">(empty)</h3>
      <h4></h4>
      <table class="table-responsive m-2">
        <tr>
          <td>Started:</td>
          <td></td>
        </tr>
        <tr>
          <td>Watered:</td>
          <td></td>
        </tr>
        <tr>
          <td>Grow time:</td>
          <td></td>
        </tr>
      </table>
      <div class="btn-group-round">
        <button type="button" class="btn btn-success m-1">Add seed</button>
        <button type="button" class="btn btn-primary m-1">Water</button>
        <button type="button" class="btn btn-danger m-1">Empty</button>
      </div>
    </div>
    `;
    $("#jar-container").append(jarHtml);
    updateJar(item.id);
  });
}

function fillJar() {
  $("#seed-container").slideUp(); // Hide seed buttons
  if (typeof $("input:checked").val() !== "undefined") {
    let value = $("input:checked").val();
    let id = jarId;
    let jar = jarArray.find((item) => item.id === id);
    let seed = seedArray.find((item) => item.name === value);
    if (jar.empty === false) {
      if (confirm("Jar not empty! Are you sure?")) {
        jar.fill(seed);
        jar.water();
        growDuration();
        updateJar(id);
      }
    } else if (jar.empty === true) {
      jar.fill(seed);
      jar.water();
      growDuration();
      updateJar(id);
    }
  } else {
    alert("Please pick a seed first.");
  }
}

function waterJar() {
  let id = $(this).parent().parent("div").attr("id");
  let jar = jarArray.find((item) => item.id === id);
  if (jar.empty === false) {
    jar.water();
    $("#" + id + " td:contains('Watered')")
      .next()
      .removeClass("text-danger");
    updateJar(id);
  }
  alertCount = 0;
}

function emptyJar() {
  let id = $(this).parent().parent("div").attr("id");
  let jar = jarArray.find((item) => item.id === id);
  if (jar.empty === false) {
    if (confirm("Are you sure you want to empty the jar?")) {
      jar.clear();
      updateJar(id);
    }
  }
}

function drainTime() {
  return this.seed.soakTime;
}

function updateJar(id) {
  let jar = jarArray.find((item) => item.id === id);

  $("#" + id + " h3").text(jar.seed.name);
  if (jar.empty === false) {
    $("#" + id + " h4").html(
      `Growing for <span class="days-text">${jar.growDuration}</span>`
    );
  }
  $("#" + id + " td:contains('Started')")
    .next()
    .text(jar.fillTime);
  $("#" + id + " td:contains('Watered')")
    .next()
    .text(jar.wateringLog[jar.wateringLog.length - 1]);
  $("#" + id + " td:contains('Grow time')")
    .next()
    .text(jar.seed.growTime);

  if (jar.empty === true) {
    $("#" + id + " h3").text("(empty)");
    $("#" + id + " td:contains('Grow time')")
      .next()
      .text("");
    $("#" + id + " td:contains('Watered')")
      .next()
      .text("");
  }

  saveJars(); // Save jarArray to database
}

function getTime() {
  return new Date().toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
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

function checkWaterTime() {
  let lastWatered;
  const msNow = new Date().getTime();
  jarArray.forEach((element) => {
    if (element.wateringLog.length > 0) {
      lastWatered = element.wateringLog[element.wateringLog.length - 1];
      lastWatered = convertDate(lastWatered);
      lastWatered = Date.parse(lastWatered);
      if (msNow - lastWatered > msIn12h && alertCount < jarArray.length) {
        let jarHeading =
          element.id.slice(0, 1).toUpperCase() +
          element.id.slice(1, 3) +
          " " +
          element.id.slice(3, 4);
        $("#" + element.id + " td:contains('Watered')")
          .next()
          .addClass("text-danger");
        alert(`${jarHeading} needs to be watered!`);
        alertCount++;
      }
    }
  });
}

//Swaps day and month to get standard GMT format instead of local time,
//so that you can do calculations with milliseconds the right way
function convertDate(date) {
  date = date.split(".");
  [date[0], date[1]] = [date[1], date[0]];
  date = date.join(".");
  return date;
}

function growDuration() {
  const msNow = new Date().getTime(); //gets current time in ms
  let startTime;
  let avgGrowTime;
  let growDuration;
  jarArray.forEach((element) => {
    if (!element.empty) {
      //converts to GMT milliseconds
      startTime = Date.parse(convertDate(element.fillTime));
      avgGrowTime = function () {
        const numbers = element.seed.growTime.match(/\d+/g);
        if (numbers.length === 1) {
          return numbers[0];
        } else {
          let num1 = parseInt(numbers[0]);
          let num2 = parseInt(numbers[1]);
          let avg = (num1 + num2) / 2;
          return Math.ceil(avg);
        }
      };
      growDuration = (msNow - startTime) / 3600000; //converts to hours
      if (parseInt(growDuration) === 1) {
        element.growDuration = parseInt(growDuration) + " hour";
        growDuration = growDuration / 24; //converts to days
      } else if (growDuration < 24) {
        element.growDuration = parseInt(growDuration) + " hours";
        growDuration = growDuration / 24; //converts to days
      } else {
        growDuration = growDuration / 24; //converts to days
        if (parseInt(growDuration) === 1) {
          element.growDuration = parseInt(growDuration) + " day";
        } else {
          element.growDuration = parseInt(growDuration) + " days";
        }
      }
      const twoPercent = (avgGrowTime() / 100) * 2;
      if (Number.isNaN(growDuration) || growDuration < twoPercent) {
        growDuration = twoPercent;
      }

      const growPercent = (parseFloat(growDuration) / avgGrowTime()) * 100;

      $("#" + element.id + " progress").attr("value", parseInt(growPercent));
      $("#" + element.id + " h4").html(
        `Growing for <span class="days-text">${element.growDuration}</span>`
      );
    }
  });
}

function addSeedButtons() {
  seedArray.forEach((item) => {
    $("#seed-buttons").append(
      `<label class="btn btn-warning rounded-pill flex-grow-0 shadow-sm">
      <input
      type="radio"
      name="options"
      id="${item.name}"
      value="${item.name}"
      autocomplete="off"
      />
      ${item.name}
      </label>`
    );
  });
}

function seedInfo() {
  $("#seed-info").hide();
  let seedID = $(this).attr("id");
  let seed = seedArray.find((item) => item.name === seedID);
  $("#seed-name").text(seed.name);
  $("#seed-grams").text(seed.gramsPerJar);
  $("#seed-soakTime").text(seed.soakTime);
  $("#seed-growTime").text(seed.growTime);
  $("#seed-info").fadeIn();
}
