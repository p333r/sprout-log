const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const seeds = db.collection("seeds");

class Seed {
  constructor(name, gelatinous, gramsPerJar, growTime, soakTime) {
    this.name = name;
    this.gelatinous = gelatinous;
    this.gramsPerJar = gramsPerJar;
    this.growTime = growTime;
    this.soakTime = soakTime;

    this.save = async function () {
      await seeds.set(this.name, {
        gelatinous: this.gelatinous,
        gramsPerJar: this.gramsPerJar,
        growTime: this.growTime,
        soakTime: this.soakTime,
      });
    };

    this.update = async function () {
      await seeds.set(this.name, {
        gelatinous: this.gelatinous,
        gramsPerJar: this.gramsPerJar,
        growTime: this.growTime,
        soakTime: this.soakTime,
      });
    };

    this.delete = async function () {
      await Seed.findByIdAndDelete(this._id);
    };

    this.get = async function () {
      const seed = await Seed.findById(this._id);
      return seed;
    };
  }
}

module.exports = Seed;
