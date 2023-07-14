const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const crypto = require("crypto");
const geoip = require("geoip-country");

const jwtAuth = passport.authenticate("jwt", {
  session: false,
  failureRedirect: "/login",
});

function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.redirect("/login");
  }
}

function generateRandomGuestId(length) {
  const bytes = Math.ceil(length / 2);
  const randomBytes = crypto.randomBytes(bytes);
  const hexValue = randomBytes.toString("hex");
  return "Guest-" + hexValue.slice(0, length);
}

function getCountry(req) {
  const ip = req.ip;
  return geoip.lookup(ip);
}

module.exports = {
  jwtAuth,
  isAdmin,
  generateRandomGuestId,
  getCountry,
};
