const express = require("express");
const router = express.Router();
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");

// cookieJwtExtractor extracts the JWT from the cookie
const cookieJwtExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

const opts = {
  jwtFromRequest: cookieJwtExtractor,
  secretOrKey: process.env.JWT_SECRET,
  ignoreExpiration: false,
};

// passport local strategy
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await users
        .get(jwt_payload.username)
        .then((user) => user?.props);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  async function (req, res, next) {
    const role = req.user.role;
    if (role === "admin") {
      res.redirect("/admin");
    } else {
      res.render("index", {
        title: req.user.username,
        user: req.user,
      });
    }
  }
);

router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Sign up", user: req.user });
});

router.get("/login", function (req, res, next) {
  res.render("login", { title: "Log in", user: req.user });
});

// Register new user
router.post("/signup", async function (req, res, next) {
  const { username, password } = req.body;

  try {
    const user = await users.get(username);
    if (user) {
      return res.render("signup", {
        info: "Sorry. That username already exists. Please try again.",
        user: user,
        title: "Sign up",
      });
    }

    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        console.log(err);
        return res.render("signup", {
          info: "Sorry. Something went wrong. Please try again.",
          user: user,
        });
      }

      users.set(username, {
        passwordHash: hash,
        jars: [],
        role: "user",
      });
    });
    const token = jwt.sign(
      { username: username, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.cookie("jwt", token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).jsend.error(err);
  }
});

// Login user
router.post("/login/password", async function (req, res, next) {
  const { username, password } = req.body;
  const user = await users.get(username).then((user) => user.props);
  console.log(user);
  bcrypt.compare(password, user.passwordHash, function (err, result) {
    if (err) {
      console.log(err);
      return res.render("login", {
        info: "Sorry. Something went wrong. Please try again.",
        user: user,
        title: "Log in",
      });
    }
    if (result) {
      const token = jwt.sign(
        { username: username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "300000" }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });
      res.redirect("/");
    }
  });
});

// Logut user
// TODO: Add jwt blacklist to db
router.get("/logout", function (req, res) {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

module.exports = router;
