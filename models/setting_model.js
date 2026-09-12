const { ObjectId } = require("mongodb");
const connectSetingMongo = require("../configs/setting_config");

class SettingModel {

    getAll = async () => {
        try {
            const db = await connectSetingMongo();
            const collection = db.collection("setting");

            return await collection.find({}).toArray();

        } catch (error) {
            console.log("Error:", error);
            return [];
        }
    };


    getByName = async (name) => {
        try {
            const db = await connectSetingMongo();
            const collection = db.collection("setting");

            return await collection.findOne({ name });

        } catch (error) {
            console.log("Error:", error);
            return null;
        }
    };


    getByRefresh = async(refreshToken)=>{
        try {
            const db = await connectSetingMongo()
            const collection = db.collection("setting")
            const result = await collection.findOne({refreshToken})
        } catch (error) {
            console.log("Error:", error);
            return null;
        }
    }


    // برای لاگین بعداً بهتر است getByPassword را حذف کنیم
    // چون password باید hash شده باشد.


    addInfo = async (name, password) => {

        try {

            const db = await connectSetingMongo();
            const collection = db.collection("setting");

            const result = await collection.insertOne({
                name,
                password,
                refreshToken:null,
                role:"user"
            });

            return result;

        } catch (error) {

            console.log("Error:", error);
            return null;
        }
    };


    updateRefreshToken = async(userid , refreshToken)=>{

        try {
            const db = await connectSetingMongo()
            const collection = db.collection("setting")
            const result = await collection.updateOne(
                {_id: new ObjectId(userid)}
                ,{$set:{refreshToken:refreshToken}}
            )

            return result.modifiedCount > 0;
        } catch (error) {
            console.log("Error:", error);
            return false;
        }

    }



    // تغییر پسورد
    updateInfo = async (id, password) => {

        try {

            const db = await connectSetingMongo();
            const collection = db.collection("setting");

            const result = await collection.updateOne(
                {
                    _id: new ObjectId(id)
                },
                {
                    $set: {
                        password: password
                    }
                }
            );

            return result.modifiedCount > 0;

        } catch (error) {

            console.log("Error:", error);
            return false;
        }
    };

}

module.exports = new SettingModel();