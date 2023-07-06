const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;

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

module.exports = {
  jwtAuth,
  isAdmin,
};
