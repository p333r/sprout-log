const express = require("express");
const router = express.Router();
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const users = db.collection("users");
const User = require("../models/user");
const {
  jwtAuth,
  generateRandomGuestId,
  getCountry,
} = require("../services/helpers");
const { rateLimit } = require("express-rate-limit");
const demoJars = require("../services/demoJars");

// Rate limit login attempts
const limit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
});

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

// Home page
router.get("/", jwtAuth, async function (req, res, next) {
  // TODO: Remove after a while ////////////////////////////// (updates country for all users)
  const user = new User(req.user.username);
  await user.get();
  user.country = getCountry(req);
  await user.save();
  //////////////////////////////

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
    user: null,
    page: "signup",
    message: null,
    success: false,
  });
});

// Login page
router.get("/login", function (req, res, next) {
  res.render("login", {
    user: null,
    page: "login",
    message: null,
  });
});

//TODO: Temporarily disabled guest login and signup

// Guest login
// router.get("/login/guest", limit, async function (req, res, next) {
//   const token = cookieJwtExtractor(req);
//   if (token) {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role === "guest") {
//       return res.redirect("/");
//     }
//   }
//   const id = generateRandomGuestId(3);
//   const exists = await users.get(id);
//   if (!exists) {
//     try {
//       const user = new User(id, null, demoJars(), "guest");
//       user.country = getCountry(req);
//       console.info(user.country);
//       await user.save();
//       await user.get();
//       console.info("Guest user created");
//       const token = jwt.sign(
//         { username: id, role: "guest" },
//         process.env.JWT_SECRET,
//         {
//           expiresIn: "365 days",
//         }
//       );
//       res.cookie("jwt", token, {
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60 * 24 * 365,
//       });
//       res.redirect("/");
//     } catch (err) {
//       console.info(err);
//     }
//   } else {
//     console.info("User already exists");
//     res.redirect("/login/guest");
//   }
// });

// Register new user
// router.post("/signup", limit, async function (req, res, next) {
//   const { username, password, confirm } = req.body;
//   if (password !== confirm) {
//     return res.render("signup", {
//       message: "Passwords do not match. Please try again.",
//       user: null,
//       success: false,
//       page: "signup",
//     });
//   }

//   try {
//     const exists = await users.get(username);
//     if (exists) {
//       return res.render("signup", {
//         message: "Sorry. That username already exists. Please try again.",
//         user: null,
//         success: false,
//         page: "signup",
//       });
//     }

//     let user;

//     bcrypt.hash(password, 10, async function (err, hash) {
//       if (err) {
//         console.info(err);
//         return res.render("signup", {
//           message: "Sorry. Something went wrong. Please try again.",
//           user: null,
//           success: false,
//           page: "signup",
//         });
//       }
//       user = new User(username, hash, [], "user");
//       user.country = getCountry(req);
//       await user.save();
//       const token = jwt.sign(
//         { username: username, role: "user" },
//         process.env.JWT_SECRET,
//         { expiresIn: "60 days" }
//       );
//       res.cookie("jwt", token, {
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60 * 24 * 60,
//       });
//       res.status(201);
//       res.redirect("/");
//     });
//   } catch (err) {
//     console.info(err);
//     res.status(500).jsend.error(err);
//   }
// });

Login user
router.post("/login", limit, async function (req, res, next) {
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
        { expiresIn: "60 days" }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 60,
      });
      res.redirect("/");
    } else {
      res.render("login", {
        message: "Invalid username or password",
        user: null,
        page: "login",
      });
    }
  });
});

// Logout user
// TODO: Add jwt blacklist to db
router.get("/logout", function (req, res) {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

module.exports = router;
