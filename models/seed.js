// const dynamoose = require("dynamoose");

// const seedSchema = new dynamoose.Schema({
//   name: { type: String, required: true },
//   gelatinous: { type: Boolean, default: false },
//   gramsPerJar: { type: Number, required: true },
//   growTime: { type: String, required: true },
//   soakTime: { type: String, required: true },
// });

// module.exports = dynamoose.model("Seed", seedSchema);

const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);

// create a collection
const seeds = db.collection("seeds");

// make a class for dynamodb model seed
class Seed {
  constructor(name, gelatinous, gramsPerJar, growTime, soakTime) {
    this.name = name;
    this.gelatinous = gelatinous;
    this.gramsPerJar = gramsPerJar;
    this.growTime = growTime;
    this.soakTime = soakTime;
  }
}

module.exports = Seed;
