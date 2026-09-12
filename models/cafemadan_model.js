const { ObjectId } = require("mongodb")
const connectMongo = require("../configs/mongo_config")

class CafeMadanModels {
    getAll = async()=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("cafe")
            const result = await collection.find({}).toArray()
            return result
        } catch (error) {
            console.log("Error: ",error)
            return []
        }
    }

    getByName = async(name)=>{
          try {
            const db = await connectMongo()
            const collection = db.collection("cafe")
            const result = await collection.findOne({name})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByCompenyName = async(compenyname)=>{
          try {
            const db = await connectMongo()
            const collection = db.collection("cafe")
            const result = await collection.findOne({compenyname})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByPhone = async(phone)=>{
          try {
            const db = await connectMongo()
            const collection = db.collection("cafe")
            const result = await collection.findOne({phone})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByEmail = async(email)=>{
          try {
            const db = await connectMongo()
            const collection = db.collection("cafe")
            const result = await collection.findOne({email})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByText = async(message)=>{
          try {
            const db = await connectMongo()
            const collection = db.collection("cafe")
            const result = await collection.findOne({message})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    addInfo = async(name,compenyname,phone,email,message)=>{
          try {
            const db = await connectMongo()
            const collection = db.collection("cafe")
            const result = await collection.insertOne({name,compenyname,phone,email,message,status: "جدید",createdAt: new Date()})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    updateInfo = async (
    id,
    name,
    compenyname,
    phone,
    email,
    message,
    status
) => {

    try {

        const db = await connectMongo();
        const collection = db.collection("cafe");

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (compenyname !== undefined) {
            updateData.compenyname = compenyname;
        }

        if (phone !== undefined) {
            updateData.phone = phone;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        if (message !== undefined) {
            updateData.message = message;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        console.log("UPDATE DATA:", updateData);

        const result = await collection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: updateData
            }
        );

        console.log("UPDATE RESULT:", result);

        return result.matchedCount > 0;

    } catch (error) {

        console.log("Error:", error);

        return false;
    }
};


    deleteInfo = async(id)=>{
        try {
            const db = await connectMongo()
        const collection = db.collection("cafe")

        const result = await collection.deleteOne(
            {_id: new ObjectId(id)}
        )

        return result.deletedCount > 0;
        } catch (error) {
            console.log("Error: ",error)
            return false
        }
    }


}

module.exports = new CafeMadanModels()