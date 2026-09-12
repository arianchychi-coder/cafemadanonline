const RequestMadanModels = require("../models/request_model")
const Joi = require("joi")


const requestForm = Joi.object({
    name:Joi.string().min(3).required(),
    phone:Joi.string().length(11).pattern(/^[0-9]+$/).required()
})

const validate = (schema, data) => schema.validate(data)

const getAll = async(req,res)=>{
    try {
        const zodiac = await RequestMadanModels.getAll()
        const users = zodiac.map(user=>({
            id:user._id,
            name:user.name,
            phone:user.phone,
            status: user.status,
            createdAt:user.createdAt
        }))

        res.json(users)
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}


const addInfo = async(req,res)=>{

    


    const {error} = validate(requestForm, req.body)


    if (error) {
        return res.status(400).json({message: error.details[0].message})
    }


    const {name,phone} = req.body


    try {

        const result = await RequestMadanModels.addInfo(name,phone)


        if (!result) {
            return res.status(400).json({message:"Err in save info"})
        }


        const user = await RequestMadanModels.getByPhone(phone)

        if (!user) {
            return res.status(401).json({message:"Err in email"})
        }


        return res.status(201).json({message:"درخواست شما ثبت شد"})
        
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}




const updateStatus = async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {

        return res.status(400).json({
            message: "وضعیت ارسال نشده است"
        });

    }

    try {

        const result =
            await RequestMadanModels.updateStatus(
                id,
                status
            );

        if (!result) {

            return res.status(404).json({
                message: "درخواست پیدا نشد"
            });

        }

        return res.status(200).json({

            message: "وضعیت با موفقیت تغییر کرد",

            status: status

        });

    } catch (error) {

        console.error(
            "Update Status Error:",
            error
        );

        return res.status(500).json({
            message: "Err in server"
        });

    }
};




const deleteInfo = async(req,res)=>{
    const {id} = req.params

    try {
        const result = await RequestMadanModels.deleteInfo(id)

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
    getAll,addInfo,deleteInfo,updateStatus
}