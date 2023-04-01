const express = require("express");
const router = express.Router();
const Seed = require("../models/seed");

router.get("/", async function (req, res, next) {
  const seeds = await Seed.find();
  res.json(seeds);
});

// Create new seed
router.post("/", isAdmin, async function (req, res, next) {
  const seed = new Seed({
    name: req.body.name,
    gramsPerJar: req.body.gramsPerJar,
    growTime: req.body.growTime,
    soakTime: req.body.soakTime,
  });
  await seed.save();
  res.redirect("/admin");
});

function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
