const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Create user
const createUser = async (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const result = await user.save();
    res.json(result);
  } catch (err) {
    res.json(err);
  }
  // create web token
  const token = jwt.sign({ email: user.email }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);

  // return await user.save();
};

const loginUser = async (req, res) => {


module.exports = {
  createUser,
};
