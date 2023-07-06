const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const passport = require("passport");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");
const User = require("../models/user");
const { jwtAuth, isAdmin } = require("../services/helpers");

router.get("/", jwtAuth, async function (req, res, next) {
  const user = await users.get(req.user.username);
  res.render("index", { title: user.username });
});

router.get("/jars", jwtAuth, async function (req, res, next) {
  const username = req.user.username;
  if (username) {
    const jars = await users.get(username).then((user) => user.props.jars);
    res.json(jars);
  } else {
    res.json([]);
  }
});

router.post("/jars", jwtAuth, async function (req, res, next) {
  try {
    const username = req.user.username;
    const jars = req.body;
    const user = new User(username);
    await user.get();
    user.jars = jars;
    await user.save();
    res.redirect("/");
  } catch (err) {
    res.redirect("/login", { error: err });
  }
});

router.delete("/:username", jwtAuth, isAdmin, async function (req, res, next) {
  const user = new User(req.params.username);
  await user.delete();
  res.status(200).json({ message: `Deleted user ${req.params.username}` });
});

module.exports = router;
