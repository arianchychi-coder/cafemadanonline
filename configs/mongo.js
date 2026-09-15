require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI2);

let db = null;

async function connectMongo() {

    if (db) return db;

    await client.connect();

    db = client.db(process.env.DB_NAME);

    console.log("✅ MongoDB Connected");

    return db;
}

module.exports = connectMongo;