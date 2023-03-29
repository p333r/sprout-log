const express = require("express");
const router = express.Router();


router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Sprout Log" });
});

router.get("/login", function (req, res, next) {
  res.render("login", { title: "Sprout Log" });
});

// Create user
router.post("/signup", async function (req, res, next) {
  const result = await client
    .db(dbName)
    .collection("Users")
    .insertOne(req.body);
  console.log(result);
  res.json(result);
});

// Login user
router.post("/login", async function (req, res, next) {
  const result = await client.db(dbName).collection("Users").findOne(req.body);
  console.log(result);
  res.json(result);
});

module.exports = router;
