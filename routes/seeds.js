const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const passport = require("passport");
const db = CyclicDB(process.env.CYCLIC_DB);
const seeds = db.collection("seeds");
const Seed = require("../models/seed");

router.get("/", async function (req, res, next) {
  const allSeeds = await seeds.list().then((data) => data.results);
  res.json(allSeeds);
});

// Create new seed
router.post(
  "/",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  isAdmin,
  async function (req, res, next) {
    console.log(req.body);
    const { name, gelatinous, gramsPerJar, growTime, soakTime } = req.body;
    const seed = new Seed(name, gelatinous, gramsPerJar, growTime, soakTime);
    await seed.save();
    res.redirect("/admin");
  }
);

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
