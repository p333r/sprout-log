const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Seed = require("../models/seed");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// passport local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.query("username").eq(username).exec();
      if (user.length === 0) {
        return done(null, false, { message: "Incorrect username." });
      }
      const match = await bcrypt.compare(password, user[0].password);
      if (!match) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user[0]);
    } catch (err) {
      return done(err);
    }
  })
);

// GET /auth/login
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// POST /auth/login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

// GET /auth/signup
router.get("/signup", (req, res) => {
  res.render("auth/signup");
});
