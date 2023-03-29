const Seed = require("../models/seed");

const createSeed = async (req, res) => {
  const seed = new Seed({
    name: req.body.name,
    gelatinous: req.body.gelatinous,
    gramsPerJar: req.body.gramsPerJar,
    growTime: req.body.growTime,
    soakTime: req.body.soakTime,
  });
  return await seed.save();
};

const getSeeds = async () => {
  console.log("finding seeds");
  return await Seed.find({});
};

module.exports = {
  createSeed,
  getSeeds,
};
