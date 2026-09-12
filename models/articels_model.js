const connectMongo3 = require("../configs/articelsmongo_config")
const { ObjectId } = require("mongodb");

class ArticelsModel {
    getAll = async()=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.find({}).toArray()
            return result
        } catch (error) {
            console.log("Error: ",error)
            return []
        }
    }


    getByTitle = async(title)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({title})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }

     getByAddress = async(adress)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({adress})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByInformation = async(information)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({information})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }




    getByDate = async(date)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({date})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getBySticker = async(sticker)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({sticker})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }




    getByStatus = async(status)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({status})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByImage = async(image)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({image})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByGallery = async(gallery)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({gallery})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByVideo = async(video)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({video})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }

    getByTxt = async(txt)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.findOne({txt})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    increaseViews = async(id) => {
    try {
        const db = await connectMongo3();
        const collection = db.collection("articels");

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $inc: { views: 1 } }
        );

        return result;
    } catch (error) {
        console.log("Error:", error);
        return null;
    }
}


    addInfo = async(title,adress,information,date,sticker,status,image,gallery,video,txt)=>{
        try {
            const db = await connectMongo3()
            const collection = db.collection("articels")
            const result = await collection.insertOne({title,adress,information,date,sticker,status,image,gallery,video, views: 0,txt})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


 updateInfo = async (
    id,
    title,
    adress,
    information,
    date,
    image,
    video,
    txt
) => {
    try {
        const db = await connectMongo3();
        const collection = db.collection("articels");

        const updateData = {};

        if (title) {
            updateData.title = title;
        }

        if (adress) {
            updateData.adress = adress;
        }

        if (information) {
            updateData.information = information;
        }

        if (date) {
            updateData.date = date;
        }

        if (image) {
            updateData.image = image;
            updateData.video = "";
        }

        if (video) {
            updateData.video = video;
            updateData.image = "";
        }

        if (txt) {
            updateData.txt = txt;
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        return result.matchedCount > 0;

    } catch (error) {
        console.log("Error:", error);
        return false;
    }
};


    deleteInfo  = async(id)=>{
        try {
            const db = await connectMongo3()
        const collection = db.collection("articels")

        const result = await collection.deleteOne(
            {_id: new ObjectId(id)}
        )

        return result.deletedCount > 0
        } catch (error) {
            console.log("Error: ",error)
            return false
        }
    }
}

module.exports = new ArticelsModel()