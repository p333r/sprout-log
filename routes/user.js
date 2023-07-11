const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");
const User = require("../models/user");
const { jwtAuth, isAdmin } = require("../services/helpers");

router.get("/", jwtAuth, async function (req, res, next) {
  const user = await users.get(req.user.username);
  res.render("index", { user: user.props, page: "index" });
});

router.get("/jars", jwtAuth, async function (req, res, next) {
  const username = req.user.username;
  if (username) {
    const jars = await users.get(username).then((user) => user.props.jars);
    res.status(200).json(jars);
  } else {
    res.status(404).json([]);
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
    res.status(201).json({ message: "Jars updated" });
  } catch (err) {
    res.redirect("/login", { error: err });
  }
});

router.delete("/:username", jwtAuth, isAdmin, async function (req, res, next) {
  try {
    const user = new User(req.params.username);
    await user.delete();
    res.status(200).json({ message: `Deleted user` });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
