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
  }

  async save() {
    await seeds.set(this.name, {
      gelatinous: this.gelatinous,
      gramsPerJar: this.gramsPerJar,
      growTime: this.growTime,
      soakTime: this.soakTime,
    });
  }

  async delete() {
    await seeds.delete(this.name);
  }

  // Get seed from database and update props of seed instance
  async get() {
    const { gelatinous, gramsPerJar, growTime, soakTime } = await seeds
      .get(this.name)
      .then((seed) => seed.props);

    this.gelatinous = gelatinous;
    this.gramsPerJar = gramsPerJar;
    this.growTime = growTime;
    this.soakTime = soakTime;
  }
}

module.exports = Seed;
