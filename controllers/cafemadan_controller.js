const CafeMadanModels = require("../models/cafemadan_model")
const Joi = require("joi")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")




const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:"arianchychi@gmail.com",
        pass:"fspumbtbcmdwqqrf"
    },
    tls:{
        rejectUnauthorized:false
    }
})



const formSchema = Joi.object({
    name:Joi.string().min(3).required(),
    compenyname:Joi.string().min(3).required(),
    phone: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    email:Joi.string().email().required(),
    message:Joi.string().max(100)
})


const validate = (schema, data) => schema.validate(data)

const getAll = async(req,res)=>{
    try {
        const cafemadan = await CafeMadanModels.getAll()
        const users = cafemadan.map(user=>({
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


const addInfo = async(req,res)=>{
    
    const {error} = validate(formSchema, req.body)

    if (error) {
        return res.status(400).json({message: error.details[0].message})
    }

    const {name,compenyname,phone,email,message} = req.body;


    try {
        
        const result = await CafeMadanModels.addInfo(name,compenyname,phone,email,message,new Date())

        if (!result) {
            return res.status(400).json({message:"Err in save information"})
        }



        await transporter.sendMail({
    from: "arianchychi@gmail.com",
    to: "arianchychi@gmail.com",
    replyTo: email,
    subject: "درخواست جدید",
    text: `
     نام خانوادگی: ${name}
   نام شرکت: ${compenyname}
    تلفن: ${phone}
    ایمیل: ${email}
     درخواست:${message}
`
});


        const user = await CafeMadanModels.getByEmail(email)

        if (!user) {
            return res.status(403).json({message:"Err in email"})
        }


        return res.status(201).json(
            {
                message:"درخواست شما تبت شد و کارشناسان با شما تماس میگیرن"
            }
        )

    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}


const updateInfo = async(req,res)=>{
    const {id} = req.params;
    const {name , compenyname , phone , email , message} = req.body;

    try {
        
        const result = await CafeMadanModels.updateInfo(id,name,compenyname,phone,email,message)

        if (!result) {
            return res.status(404).json({message:"User not find"})
        }


        return res.status(200).json({
            message:"Update succesfull"
        })

    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}


const deleteInfo = async(req,res)=>{

    const {id} = req.params;

    try {
        
        const result = await CafeMadanModels.deleteInfo(id)


        if (!result) {
            return res.status(404).json({message:"User not find"})
        }

        return res.status(200).json({message:"Delete succesfull"})

    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}


module.exports = {
    getAll,addInfo,updateInfo,deleteInfo
}