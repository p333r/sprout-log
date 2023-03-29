var express = require("express");
var router = express.Router();
const { createSeed, getSeeds } = require("../services/seedService");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.user) {
    res.render("index", { title: "Sprout Log" });
  } else {
    res.redirect("/auth/login");
  }
});

module.exports = router;
