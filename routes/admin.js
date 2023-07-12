const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");
const seeds = db.collection("seeds");
const passport = require("passport");
const User = require("../models/user");

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
        const usersArray = await Promise.all(
          allUsers.map(async (item) => {
            let user = new User(item.key);
            await user.get();
            const dateTime = new Date(user.updated);
            user.updated = dateTime.toLocaleString("no-NO", { dateStyle: "short", timeStyle: "short" });
            item.updated = user.updated;
            item.postRequests = user.postRequests;
            return item;
          })
        );

        console.table(usersArray);

        res.render("admin", {
          title: "Admin Page",
          user: req.user,
          users: usersArray,
          seeds: allSeeds,
          page: "admin",
        });
      }
    } else {
      res.redirect("/login");
    }
  }
);

module.exports = router;
