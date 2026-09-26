require("dotenv").config()

const {MongoClient} = require("mongodb")


const client = new MongoClient(process.env.MONGO_URL)


async function loginandregisterconnect(params) {
    try {
        
        await client.connect()
        console.log("Connect to Data: ",process.env.MONGO_URL)
        const db = client.db(process.env.DB_NAME)
        return db
    } catch (error) {
        console.log("Error: ",error)
    }
}


module.exports = loginandregisterconnect