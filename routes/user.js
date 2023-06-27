const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const passport = require("passport");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");

router.get("/", async function (req, res, next) {
  const user = await users.get(req.user.username);
  res.render("index", { title: user.username });
});

router.get("/jars", async function (req, res, next) {
  if (req.user) {
    const user = await users.get(req.user._id);
    res.json(user.jars);
  } else {
    res.json([]);
  }
});

router.post("/jars", async function (req, res, next) {
  if (req.user) {
    const user = await User.findById(req.user._id);
    user.jars = req.body;
    await user.save();
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
