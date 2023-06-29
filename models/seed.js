const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
const seeds = db.collection("seeds");

class Seed {
  constructor(name = "none", gelatinous, gramsPerJar, growTime, soakTime) {
    this.name = name;
    this.gelatinous = gelatinous;
    this.gramsPerJar = gramsPerJar;
    this.growTime = growTime;
    this.soakTime = soakTime;
  }

  async save() {
    seeds.set(this.name, {
      gelatinous: this.gelatinous,
      gramsPerJar: this.gramsPerJar,
      growTime: this.growTime,
      soakTime: this.soakTime,
    });
  }

  async delete() {
    seeds.delete(this.name);
  }

  // Get seed from database and update props of seed instance
  async get() {
    return seeds
      .get(this.name)
      .then((seed) => seed.props)
      .then((props) => {
        this.gelatinous = props.gelatinous;
        this.gramsPerJar = props.gramsPerJar;
        this.growTime = props.growTime;
        this.soakTime = props.soakTime;
        return this;
      });
  }
}

module.exports = Seed;
