const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", async function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/jars", async function (req, res, next) {
  if (req.user) {
    const user = await User.findById(req.user._id);
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
