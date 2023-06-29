const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;

const jwtAuth = passport.authenticate("jwt", {
  session: false,
  failureRedirect: "/login",
});

module.exports = {
  jwtAuth,
};
