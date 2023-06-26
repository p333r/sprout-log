require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var session = require("express-session");


var indexRouter = require("./routes/index");
var seedsRouter = require("./routes/seeds");
var userRouter = require("./routes/user");

var app = express();

// dynamoose models
const Seed = require("./models/seed");
const User = require("./models/user");


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret:
      "79631e58df175bf7996e138ef6d0dd9e1dc4515282802969c0b79959322e16b1e552a347f7a99e4adaf403fa4b68e9dae9f3a547afdf2974d14c2872c3148c8a",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(passport.authenticate("session"));

app.use("/", indexRouter);
app.use("/seeds", seedsRouter);
app.use("/user", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
