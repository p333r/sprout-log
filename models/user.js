const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, required: true, default: "user" },
  jars: { type: Array, required: false },
});

// Adds username and password fields to the schema and adds methods to the model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
