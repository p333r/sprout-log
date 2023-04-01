const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Seed = require("../models/seed");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// User.createStrategy() is a method provided by passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser() and passport.deserializeUser() are methods provided by passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* GET home page. */
router.get("/", async function (req, res, next) {
  if (req.user) {
    res.render("index", {
      title: req.user.username,
      user: req.user,
    });
  } else {
    res.redirect("/login");
  }
});

router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Sign up", user: req.user });
});

router.get("/login", function (req, res, next) {
  res.render("login", { title: "Log in", user: req.user });
});

// Register new user
router.post("/signup", async function (req, res, next) {
  User.register(
    // User.register() is a method provided by passport-local-mongoose
    new User({ username: req.body.username }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.render("signup", {
          info: "Sorry. That username already exists. Please try again.",
          user: user,
        });
      }

      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  );
});

// Login user
router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// Logut user
router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Admin page
router.get("/admin", function (req, res, next) {
  if (req.user?.role === "admin") {
    getData();
    async function getData() {
      const users = await User.find({});
      const seeds = await Seed.find({});
      console.log(users);
      res.render("admin", {
        title: "Admin",
        user: req.user,
        users: users,
        seeds: seeds,
      });
    }
  } else {
    res.redirect("/login");
  }
});


module.exports = router;
