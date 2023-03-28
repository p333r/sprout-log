const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;
const client = new MongoClient(url);

async function connectMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err.stack);
  }
}

connectMongoDB();

/* GET users listing. */
router.get("/", async function (req, res, next) {
  const result = await client.db(dbName).collection("Users").find({}).toArray();
  console.log(result);
  res.json(result);
});

// Create user
router.post("/signup", async function (req, res, next) {
  const result = await client
    .db(dbName)
    .collection("Users")
    .insertOne(req.body);
  console.log(result);
  res.json(result);
});

// Login user
router.post("/login", async function (req, res, next) {
  const result = await client
    .db(dbName)
    .collection("Users")
    .findOne(req.body);
  console.log(result);
  res.json(result);
});
    


module.exports = router;
