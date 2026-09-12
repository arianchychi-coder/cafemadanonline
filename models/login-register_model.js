const { ObjectId } = require("mongodb")
const loginandregisterconnect = require("../configs/login-register_config")

class LoginAndRegisterModels {
    getAll = async()=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.find({}).toArray()
            return result
        } catch (error) {
            console.log("Error: ",error)
                        return []
        }
    }


    getById = async (id) => {
    try {
        const db = await loginandregisterconnect();
        const collection = db.collection("loginregister");

        const result = await collection.findOne({
            _id: new ObjectId(id)
        });

        return result;

    } catch (error) {
        console.log("Error: ", error);
        return null;
    }
}

    getByName = async(name)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.findOne({name})
            return result
        } catch (error) {
            console.log("Error: ",error)
                        return null
        }
    }

    getByLastname = async(lastname)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.findOne({lastname})
            return result
        } catch (error) {
            console.log("Error: ",error)
                        return null
        }
    }

    getByEmail = async(email)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.findOne({email})
            return result
        } catch (error) {
            console.log("Error: ",error)
                        return null
        }
    }


     getByPhone = async(phone)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.findOne({phone})
            return result
        } catch (error) {
            console.log("Error: ",error)
                        return null
        }
    }


     getByPassword = async(password)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.findOne({password})
            return result
        } catch (error) {
            console.log("Error: ",error)
                        return null
        }
    }


    getByConfirmPassword = async(confirmpassword)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.findOne({confirmpassword})
            return result
        } catch (error) {
            console.log("Error: ",error)
                        return null
        }
    }


    getByRefreshToken = async(refreshToken)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.findOne({refreshToken})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }


    addInfo = async(name,lastname,email,phone,password,confirmpassword)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.insertOne({name,lastname,email,phone,password,confirmpassword,refreshToken:null,role:"user",creatAt: new Date()})
            return result
        } catch (error) {
            console.log("Error: ",error)
            return null
        }
    }



    updateRefreshToken = async(userid,refreshToken)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")
            const result = await collection.updateOne(
                {_id: new ObjectId(userid)},
                {$set:{refreshToken:refreshToken}}
            )

            return result.modifiedCount > 0
        } catch (error) {
            console.log("Error: ",error)
            return false
        }
    }


    updateInfo = async(id , role)=>{
        try {
            const db = await loginandregisterconnect()
            const collection = db.collection("loginregister")


            const updateData = {}


            if (role) {
                updateData.role = role
            }



            const result = await collection.updateOne(
                {_id: new ObjectId(id)},
                {$set:updateData}
            )


            return result.modifiedCount > 0
        } catch (error) {
            console.log("Error: ",error)
        }
    }
}


module.exports = new LoginAndRegisterModels()