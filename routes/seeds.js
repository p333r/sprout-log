const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const passport = require("passport");
const db = CyclicDB(process.env.CYCLIC_DB);
const seeds = db.collection("seeds");
const Seed = require("../models/seed");
const { jwtAuth } = require("../services/helpers");

router.get("/", async function (req, res, next) {
  const allSeeds = await seeds.list().then((data) => data.results);
  const seedsMap = allSeeds.map((seed) => seed.key);
  console.log(seedsMap);
  const seedArray = [];
  await async function () { seedsMap.forEach(async (seed) => {
    let item = new Seed(seed);
    console.log(item);
    await item.get();
    seedArray.push(item);
  });
  };
  console.log("11111111111111111", seedArray);
  res.json(seedArray);
});

// Create new seed
router.post("/", jwtAuth, isAdmin, async function (req, res, next) {
  const { name, gelatinous, gramsPerJar, growTime, soakTime } = req.body;
  const seed = new Seed(name, gelatinous, gramsPerJar, growTime, soakTime);
  await seed.save();
  res.redirect("/admin");
});

// Delete seed
router.delete(
  "/seeds/:name",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  isAdmin,
  async function (req, res, next) {
    const seed = new Seed(req.params.name);
    await seed.delete();
    res.redirect("/admin");
  }
);

function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
