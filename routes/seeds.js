const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const passport = require("passport");
const db = CyclicDB(process.env.CYCLIC_DB);
const seeds = db.collection("seeds");

router.get("/", async function (req, res, next) {
  const allSeeds = await seeds.list().then((data) => data.results);
  console.log(allSeeds);
  res.json(allSeeds);
});

// Create new seed
router.post(
  "/",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  isAdmin,
  async function (req, res, next) {
    await seeds.set(req.body.name, {
      gramsPerJar: req.body.gramsPerJar,
      growTime: req.body.growTime,
      soakTime: req.body.soakTime,
    });
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
