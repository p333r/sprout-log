const dynamoose = require("dynamoose");

const seedSchema = new dynamoose.Schema({
  name: { type: String, required: true },
  gelatinous: { type: Boolean, default: false },
  gramsPerJar: { type: Number, required: true },
  growTime: { type: String, required: true },
  soakTime: { type: String, required: true },
});

module.exports = dynamoose.model("Seed", seedSchema);
