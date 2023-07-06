const express = require("express");
const router = express.Router();
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");
const { jwtAuth } = require("../services/helpers");

// Create admin user if not exists
users
  .get("admin")
  .then((user) => {
    if (!user) {
      bcrypt.hash(process.env.ADMIN_PASSWORD, 10, function (err, hash) {
        if (err) {
          console.info(err);
        } else {
          users.set("admin", {
            username: "admin",
            passwordHash: hash,
            role: "admin",
          });
        }
      });
    }
  })
  .catch((err) => {
    console.info(err);
  });

// cookieJwtExtractor function, extracts the JWT from the cookie
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
      const exist = await users.get(jwt_payload.username);
      if (!exist) {
        return done(null, false);
      }
      const user = {
        username: jwt_payload.username,
        role: jwt_payload.role,
      };
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

router.get("/", jwtAuth, async function (req, res, next) {
  const role = req.user.role;
  if (role === "admin") {
    res.redirect("/admin");
  } else {
    res.render("index", {
      user: req.user,
      page: "home",
    });
  }
});

// Signup and login routes
router.get("/signup", function (req, res, next) {
  res.render("signup", {
    user: req.user,
    page: "signup",
    message: null,
    success: false,
  });
});

router.get("/login", function (req, res, next) {
  res.render("login", {
    user: req.user,
    page: "login",
    message: null,
  });
});

// Register new user
router.post("/signup", async function (req, res, next) {
  const { username, password, confirm } = req.body;

  if (password !== confirm) {
    return res.render("signup", {
      message: "Passwords do not match. Please try again.",
      user: null,
      success: false,
      page: "signup",
    });
  }

  try {
    const user = await users.get(username);
    if (user) {
      return res.render("signup", {
        message: "Sorry. That username already exists. Please try again.",
        user: null,
        success: false,
        page: "signup",
      });
    }

    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        console.info(err);
        return res.render("signup", {
          message: "Sorry. Something went wrong. Please try again.",
          user: null,
          success: false,
          page: "signup",
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
    res.render("signup", {
      message: "User created successfully! <a href='/login'>Log in here.</a>",
      success: true,
      user: null,
      page: "signup",
    });
  } catch (err) {
    console.info(err);
    res.status(500).jsend.error(err);
  }
});

// Login user
router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;
  //TODO: Add verification for username and password
  const user = await users.get(username).then((user) => user?.props);
  if (!user) {
    return res.render("login", {
      message: "Invalid username or password",
      user: null,
      page: "login",
    });
  }
  bcrypt.compare(password, user.passwordHash, function (err, result) {
    if (err) {
      console.info(err);
      return res.render("login", {
        message: "Sorry. Something went wrong. Please try again.",
        user: null,
        page: "login",
      });
    }
    if (result) {
      const token = jwt.sign(
        { username: username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });
      res.redirect("/");
    } else {
      res.render("login", {
        message: "Invalid username or password",
        user: user,
        page: "login",
      });
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
