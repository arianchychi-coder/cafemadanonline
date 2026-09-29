require("dotenv").config()
const {MongoClient} = require("mongodb")

const client = new MongoClient(process.env.MONGODB_URI2)

async function connectMongo3() {
    try {
        await client.connect()
        console.log("Connected to DB: ",process.env.MONGODB_URI2)
        const db = client.db(process.env.DB_NAME)
        return db
    } catch (error) {
        console.log("Error: ",error)
    }
}

module.exports = connectMongo3