const KhabarnameModel = require("../models/Khabarname_model")



const Joi = require('joi')

const postKhabarnamee = Joi.object({
    title:Joi.string().min(3).required(),
    desc:Joi.string().min(3).required(),
    number:Joi.string().required(),
    tag:Joi.string().min(3).required(),
    time:Joi.string().required(),
    status:Joi.string().valid("draft", "published"),
    CreatedAt:Joi.string().required(),
    image: Joi.string().allow(null, "")
})


const updateKhabarnamee = Joi.object({
    title:Joi.string().min(3).required(),
    desc:Joi.string().min(3).required(),
    number:Joi.string().required(),
    tag:Joi.string().min(3).required(),
    time:Joi.string().required(),
    status:Joi.string().valid("draft", "published"),
    CreatedAt:Joi.string().required(),
    image: Joi.string().allow(null, "")
})



const validate = (schema, data) => schema.validate(data)

const getAll = async(req,res)=>{
    try {
        const khabarname = await KhabarnameModel.getAll()
        const users = khabarname.map(user=>({
            id:user._id.toString(),
            title:user.title,
            desc:user.desc,
            number:user.number,
            tag:user.tag,
            time:user.time,
            status:user.status,
            image:user.image,
            CreatedAt:user.CreatedAt
        }))

        res.json(users)
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message: "Err in server"});
    }
}



const addInfo = async(req,res)=>{

    const {error} = validate(postKhabarnamee, req.body)


    if (error) {
        return res.status(400).json({message:error.details[0].message})
    }
    

    const {title,desc,number,tag,time,status,CreatedAt} = req.body


     // کد اصلی //
      //  const image = req.file ? req.file.filename : null//


        const image = req.body.image || null;


    try {

        const result = await KhabarnameModel.addInfo(title,desc,number,tag,time,status,image,CreatedAt)

        if (!result) {
            return res.status(400).json({message:"Ere in save information"})
        }


        return res.status(201).json({
            message:"Khanbarname Add"
        })
        
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message: "Err in server"});
    }
}



const updateInfo = async(req,res)=>{

    const {error} = validate(updateKhabarnamee, req.body)


    if (error) {
        return res.status(400).json({message:error.details[0].message})
    }


    const {id} = req.params;

    const{title,desc,number,tag,time,status,CreatedAt} = req.body


    try {
        const result = await KhabarnameModel.updateInfo(id,title,desc,number,tag,time,status,CreatedAt)


        if (!result) {
            return res.status(404).json({message:"خبر نامه پیدا نشد"})
        }

        return res.status(200).json({
            message:"Update Successful"
        })
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message: "Err in server"});
    }
}



const deleteInfo = async(req,res)=>{
    const {id} = req.params;


    try {
        const result = await KhabarnameModel.addInfo(id)

        if (!result) {
            return res.status(404).json({message:"خبر نامه پیدا نشد"})
        }


        return res.status(200).json({
            message:"Delete Successfull"
        })
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message: "Err in server"});
    }
}


module.exports = {
    getAll,addInfo,updateInfo,deleteInfo
}