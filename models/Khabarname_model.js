const { ObjectId } = require("mongodb")
const connectKhabarname = require("../configs/Khabarname_config")


class KhabarnameModel {
    getAll = async()=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.find({}).toArray()
            return result
        } catch (error) {
            console.log("Error: ",error)
            return []
        }
    }


    getById = async(id)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne(
                {_id: new ObjectId(id)}
            )
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByTitle = async(title)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne({title})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByDesc = async(desc)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne({desc})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByNumber = async(number)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne({number})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByTag = async(tag)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne({tag})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }



    getByTime = async(time)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne({time})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }



    getByStatus = async(status)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne({status})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }



    getByImage = async(image)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.findOne({image})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    addInfo = async(title,desc,number,tag,time,status,image)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.insertOne({title,desc,number,tag,time,status,image,CreatedAt: new Date()})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    updateInfo = async(id,title,desc,number,tag,time,status,image) =>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const updateData = {}


            if (title) {
                updateData.title = title
            }


            if (desc) {
                updateData.desc = desc
            }


            if (number) {
                updateData.number = number
            }


            if (tag) {
                updateData.tag = tag
            }


            if (time) {
                updateData.time = time
            }


            if (status) {
                updateData.status = status
            }



            if (image) {
                updateData.image = image
            }



            const result = await collection.updateOne(
                {_id:new ObjectId(id)},
                {$set:updateData}
            )


            return result.modifiedCount > 0
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }




    deleteInfo = async(id)=>{
        try {
            const db = await connectKhabarname()
            const collection = db.collection("khabarname")
            const result = await collection.deleteOne(
                {_id:new ObjectId(id)}
            )
            return result.deletedCount > 0
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }
}


module.exports = new KhabarnameModel()