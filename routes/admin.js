const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");
const seeds = db.collection("seeds");
const bcrypt = require("bcrypt");
const { all } = require("./auth");
const passport = require("passport");

// Admin page
router.get(
  "/",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  function (req, res, next) {
    if (req.user?.role === "admin") {
      getData();
      async function getData() {
        const allUsers = await users.list().then((data) => data.results);
        const allSeeds = await seeds.list().then((data) => data.results);
        res.render("admin", {
          title: "Admin Page",
          user: req.user,
          users: allUsers,
          seeds: allSeeds,
        });
        console.log(allSeeds);
        console.log(allUsers);
      }
    } else {
      res.redirect("/login");
    }
  }
);

module.exports = router;
