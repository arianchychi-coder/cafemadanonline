
const { ObjectId } = require("mongodb");
const connectMongo2 = require("../configs/mongo_config");

class CafeMadanModels {

    getAll = async () => {

        try {

            const db = await connectMongo2();

            const collection =
                db.collection("request");

            const result =
                await collection.find({}).toArray();

            return result;

        } catch (error) {

            console.log("Error: ", error);

            return [];
        }
    };


    getByName = async (name) => {

        try {

            const db = await connectMongo2();

            const collection =
                db.collection("request");

            const result =
                await collection.findOne({ name });

            return result;

        } catch (error) {

            console.log("Error: ", error);

            return null;
        }
    };


    getByPhone = async (phone) => {

        try {

            const db = await connectMongo2();

            const collection =
                db.collection("request");

            const result =
                await collection.findOne({ phone });

            return result;

        } catch (error) {

            console.log("Error: ", error);

            return null;
        }
    };


    addInfo = async (name, phone) => {

        try {

            const db = await connectMongo2();

            const collection =
                db.collection("request");

            const result =
                await collection.insertOne({

                    name,

                    phone,

                    status: "در انتظار تماس",

                    createdAt: new Date()

                });

            return result;

        } catch (error) {

            console.log("Error: ", error);

            return null;
        }
    };


    updateStatus = async (id, status) => {

        try {

            const db = await connectMongo2();

            const collection =
                db.collection("request");

            const result =
                await collection.updateOne(

                    {
                        _id: new ObjectId(id)
                    },

                    {
                        $set: {
                            status: status
                        }
                    }

                );

            return result.matchedCount > 0;

        } catch (error) {

            console.log(
                "Update Status Error: ",
                error
            );

            return false;
        }
    };


    deleteInfo = async (id) => {

        try {

            const db = await connectMongo2();

            const collection =
                db.collection("request");

            const result =
                await collection.deleteOne({

                    _id: new ObjectId(id)

                });

            return result.deletedCount > 0;

        } catch (error) {

            console.log("Error: ", error);

            return false;
        }
    };

}


module.exports = new CafeMadanModels();

