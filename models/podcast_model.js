const { ObjectId } = require("mongodb")
const connectPodcastMongo = require("../configs/podcast_config")

class PodcastModel {
    getAll = async()=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.find({}).toArray()
            return result
        } catch (error) {
            console.log("Error: ",error)
            return []
        }
    }


    getById = async(id)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.findOne(
                {_id: new ObjectId(id)}
            )
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByEpisod = async(episod)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.findOne({episod})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByTitle = async(title)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.findOne({title})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }



    getByTime = async(time)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.findOne({time})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }

    getByStatus = async(status)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.findOne({status})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByAudio = async(audio)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.findOne({audio})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    getByCover = async(cover)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.findOne({cover})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }



    addInfo = async(episod,title,time,audio,status,cover)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.insertOne({episod,title,time,audio,status,cover,createdAT: new Date()})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    updateInfo = async(id,episod,title,time,status,audio,cover)=>{
        try {

            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const updateData = {}

            if (episod) {
                updateData.episod = episod
            }

            if (title) {
                updateData.title = title
            }

            if (time) {
                updateData.time = time
            }

            if (audio) {
                updateData.audio = audio
            }

            if (status) {
                updateData.status = status
            }


            if (cover) {
                updateData.cover = cover
            }

            const result = await collection.updateOne(
                {_id:new ObjectId(id)},
                {$set:updateData}
            )


            return result.matchedCount > 0
            
        } catch (error) {
             console.log("Error: ",error)
            return false
        }
    }


    deleteInfo = async(id)=>{
        try {
            const db = await connectPodcastMongo()
            const collection = db.collection("podcast")
            const result = await collection.deleteOne(
                {_id:new ObjectId(id)}
            )
            return result.deletedCount > 0
        } catch (error) {
            console.log("Error: ",error)
            return false
        }
    }

}

module.exports = new PodcastModel()