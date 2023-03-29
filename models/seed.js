const mongoose = require("mongoose");

const seedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gelatinous: { type: Boolean, required: true },
  gramsPerJar: { type: Number, required: true },
  growTime: { type: String, required: true },
  soakTime: { type: String, required: true },
});

module.exports = mongoose.model("Seed", seedSchema);
