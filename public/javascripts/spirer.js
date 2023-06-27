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

class Seed {
  constructor(name, gelationous, gramsPerJar, soakTime, growTime) {
    this.name = name;
    this.gelationous = gelationous;
    this.gramsPerJar = gramsPerJar;
    this.soakTime = soakTime;
    this.growTime = growTime;
  }
}

let alertCount = 0;
const jarArray = [];
const msIn24h = 86400000;
const msIn12h = msIn24h / 2;
const seedArray = [];

$(async function () {
  digitalClock();
  setInterval(digitalClock, 1000);
  await getSeeds();
  await checkDatabase();
  addSeedButtons();
  growDuration();
  checkWaterTime();
  setInterval(checkWaterTime, 600000);
  setInterval(growDuration, msIn12h);
  $("button:contains('Add seed')").click(fillJar);
  $("button:contains('Water')").click(waterJar);
  $("button:contains('Empty')").click(emptyJar);
  $("button:contains('Add jar')").click(addJar);
  $("button.btn-close").click(removeJar);
  $("#seed-buttons input").click(seedInfo);
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

async function setJars() {
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
    highestJarId = parseInt(jarArray[jarArray.length - 1].id.match(/\d+/)[0]);
  } else {
    highestJarId = 0;
  }
  let jar = new Jar("jar" + (highestJarId + 1));
  jarArray.push(jar);
  setJars(); // Save jarArray to database
  let jarHeading =
    jar.id.slice(0, 1).toUpperCase() +
    jar.id.slice(1, 3) +
    " " +
    jar.id.slice(3, 4);
  let jarHtml = `
  <div id="${jar.id}" class="card bg-secondary p-3">
  <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-2"
    aria-label="Close">
  </button>
  <h2>${jarHeading}</h2>
  <progress id="jar-progress" value="0" max="10"></progress>
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
  $("#" + jar.id + " button:contains('Add seed')").click(fillJar);
  $("#" + jar.id + " button:contains('Water')").click(waterJar);
  $("#" + jar.id + " button:contains('Empty')").click(emptyJar);
}

function jarProgress() {}

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
      setJars(); // Save jarArray to database
    }
  } else {
    let index = jarArray.indexOf(jar);
    jarArray.splice(index, 1);
    $("#" + id).remove();
    setJars(); // Save jarArray to database
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
      item.id.slice(3, 4);
    let jarHtml = `
      <div id="${item.id}" class="card bg-secondary p-3">
      <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-2"
        aria-label="Close">
      </button>
      <h2>${jarHeading}</h2>
      <progress id="jar-progress" value="0" max="10"></progress>
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
  if (typeof $("input:checked").val() !== "undefined") {
    let value = $("input:checked").val();
    let id = $(this).parent().parent("div").attr("id");
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
  $("#" + id + " h4").html(
    `Growing for <span class="text-info">${jar.growDuration}</span>`
  );
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

  setJars(); // Save jarArray to database
}

function getTime() {
  return new Date().toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function digitalClock() {
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
  let msNow = new Date().getTime(); //gets current time in ms
  let startTime;
  let avgGrowTime;
  let growDuration;
  jarArray.forEach((element) => {
    if (!element.empty) {
      //converts to GMT milliseconds
      startTime = Date.parse(convertDate(element.fillTime));
      avgGrowTime = function () {
        let a = parseInt(element.seed.growTime.slice(0, 1));
        let b = parseInt(element.seed.growTime.slice(2, 3));
        let avg = (a + b) / 2;
        return Math.ceil(avg);
      };
      element.growDuration = Math.floor((msNow - startTime) / msIn24h);
      if (element.growDuration == 1) {
        element.growDuration += " day";
      } else {
        element.growDuration += " days";
      }
      growDuration = parseInt(element.growDuration);
      if (Number.isNaN(growDuration)) {
        growDuration = 0;
      }
      $("#" + element.id + " progress")
        .attr("value", growDuration)
        .attr("max", avgGrowTime);
    }
  });
}

function addSeedButtons() {
  seedArray.forEach((item) => {
    $("#seed-buttons").append(
      `<label class="btn btn-warning rounded-pill">
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
  $("#seed-info").html(
    "<b>" +
      seed.name +
      "</b>" +
      " | " +
      "Max " +
      seed.gramsPerJar +
      "g per jar" +
      " | " +
      "Soak for " +
      seed.soakTime +
      " | " +
      "Grow time is " +
      seed.growTime
  );
  $("#seed-info").fadeIn(800);
}
