const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Seed = require("../models/seed");
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy();