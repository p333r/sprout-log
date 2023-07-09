class Jar {
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

// Global variables
const jarArray = [];
const msIn24h = 86400000;
const msIn12h = msIn24h / 2;
const seedArray = [];
let jarId; // Used in fillJar()

// Initialize page
$(async function () {
  console.log("Page loaded");
  await checkDatabase();
  await getSeeds();
  addSeedButtons();
  growDuration();
  checkWaterTime();
  setInterval(checkWaterTime, 900000); // Check every 15 minutes
  setInterval(growDuration, 900000); // Check every 15 minutes
  $("button:contains('Add seed')").click(showSeedButtons);
  $("button:contains('Water')").click(waterJar);
  $("button:contains('Empty')").click(emptyJar);
  $("button:contains('Add jar')").click(addJar);
  $("button.btn-close").click(removeJar);
  $("#seed-buttons input").click(seedInfo);
  $("#add-seed").click(fillJar);
  $("#hide-seeds").click(function () {
    $("#seed-container").slideUp("fast");
  });
  console.log("App ready");
});

async function getSeeds() {
  console.log("getSeeds() called");
  const response = await fetch("/seeds");
  const data = await response.json();
  seedArray.push(...data);
  return;
}

async function getJars() {
  console.log("getJars() called");
  const response = await fetch("/user/jars");
  const data = await response.json();
  return data;
}

async function saveJars() {
  console.log("saveJars() called");
  await fetch("/user/jars", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jarArray),
  });
  return;
}

function createJar(id, heading) {
  console.log("createJar() called");
  return `
  <div id="${id}" class="card p-2 jar">
  <div class="position-absolute top-0 start-0 m-2 p-0 jar-status">
    <img class="done-icon" src="/assets/accept.svg" alt="sprouting complete icon">
    <img class="warning-icon" src="/assets/exclamation.svg" alt="exclamation mark icon">
    <img class="drop-icon" src="/assets/drop.svg" alt="drop icon">
  </div>
  <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-2"
    aria-label="Close">
  </button>
  <h2>${heading}</h2>
  <h3 class="fs-1">(empty)</h3>
  <progress class="jar-progress" value="0" max="100"></progress>
  <h4>Add a seed to start</h4>
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
</div>`;
}

function addJar() {
  console.log("addJar() called");
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

  let jarHtml = createJar(jar.id, jarHeading);

  $("#jar-container").append(jarHtml);
  $("#" + jar.id + " button.btn-close").click(removeJar);
  $("#" + jar.id + " button:contains('Add seed')").click(showSeedButtons);
  $("#" + jar.id + " button:contains('Water')").click(waterJar);
  $("#" + jar.id + " button:contains('Empty')").click(emptyJar);
}

function showSeedButtons() {
  console.log("showSeedButtons() called");
  $("#seed-container").slideDown("fast");
  jarId = $(this).parent().parent("div").attr("id"); // Get jar id and store in global variable
  const jarName = $(this).parent().parent("div").children("h2").text();
  $("#seed-container h3").text("Add seed to " + jarName);
}

function removeJar() {
  console.log("removeJar() called");
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
  console.log("checkDatabase() called");
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
    let jarHtml = createJar(item.id, jarHeading);
    $("#jar-container").append(jarHtml);
    updateJar(item.id, false);
  });
}

function fillJar() {
  console.log("fillJar() called");
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
  console.log("waterJar() called");
  let id = $(this).parent().parent("div").attr("id");
  let jar = jarArray.find((item) => item.id === id);
  if (jar.empty === false) {
    jar.water();
    $("#" + id + " td:contains('Watered')")
      .next()
      .removeClass("text-danger");
    $("#" + id + ".jar-status .drop-icon").hide();
    $("#" + id + ".jar-status .warning-icon").hide();
    updateJar(id);
  }
}

function emptyJar() {
  console.log("emptyJar() called");
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
  console.log("drainTime() called");
  return this.seed.soakTime;
}

function updateJar(id, save = true) {
  console.log("updateJar() called");
  // Update jar info in DOM and save to database if save = true
  let jar = jarArray.find((item) => item.id === id);
  $("#" + id + " h3").text(jar.seed.name);
  $("#" + id + " h3").append("<img src='/assets/plant.svg' alt='plant icon'>");
  if (jar.empty === false) {
    $("#" + id + " .jar-status").html(`
    <img class="done-icon" src="/assets/accept.svg" alt="sprouting complete icon">
    <img class="warning-icon" src="/assets/exclamation.svg" alt="exclamation mark icon">
    <img class="drop-icon" src="/assets/drop.svg" alt="drop icon">`);
    $("#" + id + " h4").html(
      `Growing for <span class="days-text">${jar.growDuration}</span>`
    );
  }
  $("#" + id + " td:contains('Started')")
    .next()
    .text(jar.fillTime);
  $("#" + id + " td:contains('Started')")
    .next()
    .prepend(
      '<img class="start-icon" src="/assets/flag.svg" alt="start icon">'
    );
  $("#" + id + " td:contains('Watered')")
    .next()
    .text(jar.wateringLog[jar.wateringLog.length - 1]);
  $("#" + id + " td:contains('Watered')")
    .next()
    .prepend('<img class="drop-icon" src="/assets/drop.svg" alt="drop icon">');
  $("#" + id + " td:contains('Grow time')")
    .next()
    .text(jar.seed.growTime);
  $("#" + id + " td:contains('Grow time')")
    .next()
    .prepend(
      '<img class="hourglass-icon" src="/assets/hourglass.svg" alt="hourglass icon">'
    );

  if (jar.empty === true) {
    $("#" + id + " h3").text("(empty)");
    $("#" + id + " td:contains('Grow time')")
      .next()
      .text("");
    $("#" + id + " td:contains('Started')")
      .next()
      .text("");
    $("#" + id + " td:contains('Watered')")
      .next()
      .text("");
  }
  if (save === true) {
    saveJars(); // Save jarArray to database
  }
}

function getTime() {
  return new Date().toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function checkWaterTime() {
  console.log("checkWaterTime() called");
  let lastWatered;
  const msNow = new Date().getTime();
  jarArray.forEach((element) => {
    if (element.wateringLog.length > 0) {
      lastWatered = element.wateringLog[element.wateringLog.length - 1];
      lastWatered = convertDate(lastWatered);
      lastWatered = Date.parse(lastWatered);
      if (msNow - lastWatered > msIn12h) {
        $("#" + element.id + " .warning-icon").show();
        $("#" + element.id + " .drop-icon").show();
        $("#" + element.id + " td:contains('Watered')")
          .next()
          .addClass("text-danger");
      }
    }
  });
}

//Swaps day and month to get standard GMT format instead of local time,
//so that you can do calculations with milliseconds the right way
function convertDate(date) {
  console.log("convertDate() called");
  date = date.split(".");
  [date[0], date[1]] = [date[1], date[0]];
  date = date.join(".");
  return date;
}

function growDuration() {
  console.log("growDuration() called");
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

      if (growPercent >= 100) {
        $("#" + element.id + " .done-icon").show();
      }
    }
  });
}

function addSeedButtons() {
  console.log("addSeedButtons() called");
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
  console.log("seedInfo() called");
  $("#seed-info").hide();
  let seedID = $(this).attr("id");
  let seed = seedArray.find((item) => item.name === seedID);
  $("#seed-name").text(seed.name);
  $("#seed-grams").text(seed.gramsPerJar);
  $("#seed-soakTime").text(seed.soakTime);
  $("#seed-growTime").text(seed.growTime);
  $("#seed-info").fadeIn();
}
