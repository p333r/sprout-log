const dynamoose = require("dynamoose");

const userSchema = new dynamoose.Schema({
  role: { type: String, required: true, default: "user" },
  jars: { type: Array, required: true, default: [] },
  salt: { type: String, required: true },
  password: { type: String, required: true },
  hash: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
