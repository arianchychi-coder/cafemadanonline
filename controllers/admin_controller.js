const CafeMadanModels = require("../models/cafemadan_model")


const getAdmin = async(req,res)=>{
    try {
        const admin = await CafeMadanModels.getAll()
                const users = admin.map(user=>({
                    id:user._id,
                    name:user.name,
                    compenyname:user.compenyname,
                    phone:user.phone,
                    email:user.email,
                    message:user.message,
                    status: user.status,
                    createdAt: user.createdAt
                }))
        
        
                res.json(users)
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}


const postAdmin = async(req,res)=>{

    try {
        const {addInfo} = require("./cafemadan_controller")
        await addInfo(req,res)
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }

}


const putAdmin = async (req, res) => {

    const { id } = req.params;
    

    const {
        name,
        compenyname,
        phone,
        email,
        message,
        status
    } = req.body;

    try {

        const result = await CafeMadanModels.updateInfo(
            id,
            name,
            compenyname,
            phone,
            email,
            message,
            status
        );

        if (!result) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Update successfully"
        });

    } catch (error) {

        console.error("Error: ", error);

        return res.status(500).json({
            message: "Err in server"
        });
    }
};




const deleteAdmin = async(req,res)=>{
    const {id} = req.params;

    try {
        const result = await CafeMadanModels.deleteInfo(id)

    if (!result) {
        return res.status(404).json({message:"User not find"})
    }


     return res.status(200).json({
            message:"Delete succesfully"
        })
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
    
}


module.exports = {
    getAdmin,postAdmin,putAdmin,deleteAdmin
}