const LoginAndRegisterModels = require("../models/login-register_model")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const Joi = require("joi")
const jwt = require("jsonwebtoken")
const secretkey = "12345"



const registerSchema = Joi.object({
    name:Joi.string().min(3).required(),
    lastname:Joi.string().min(3).required(),
    email:Joi.string().email().required(),
    phone:Joi.string().min(11).required(),
    password:Joi.string().min(8).required(),
    confirmpassword:Joi.string().required(),
})

const loginSchema = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required(),

})


const adminlogSchema = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required(),

})


const updateSchema = Joi.object({
    role:Joi.string()
})


const validate = (schema, data) => schema.validate(data)



const generateAndSaveToken = async(user)=>{
    const accessToken = jwt.sign({
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
        },secretkey,{expiresIn:"24h"})


        const refreshToken = crypto.randomBytes(32).toString('hex')
        const hashRefreshToken = await bcrypt.hash(refreshToken,10)


        const update = await LoginAndRegisterModels.updateRefreshToken(user._id.toString(),hashRefreshToken)


        if (!update) {
            throw new Error("Faild to update refreshToken in data base")
        }

        return {accessToken,refreshToken}
}


const getAll = async(req,res)=>{
    try {
        const logreg = await LoginAndRegisterModels.getAll()
        const users = logreg.map(user =>({
            id:user._id.toString(),
            name:user.name,
            lastname:user.lastname,
            email:user.email,
            phone:user.phone,
            creatAt:user.creatAt,
            role:user.role
        }))

        res.json(users)
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}



const register = async(req,res) =>{

    const {error} = validate(registerSchema, req.body)
    

        if (error) {
        return res.status(400).json({message: error.details[0].message})
    }

    const {name,lastname,email,phone,password,confirmpassword} = req.body



    try {

                if (password !== confirmpassword) {
             return res.status(403).json({message:"خطا در یکسان بودن رمز عبور"})
        }

        const exitEmail = await LoginAndRegisterModels.getByEmail(email)

        if (exitEmail) {
            return res.status(409).json({message:"این ایمیل قبلا ثبت شده است"})
        }
        
        const hashPassword = await bcrypt.hash(password,10)
         const hashConfirmPassword = await bcrypt.hash(confirmpassword,10)
        const result = await LoginAndRegisterModels.addInfo(name,lastname,email,phone,hashPassword,hashConfirmPassword)


        if (!result) {
            return res.status(400).json({message:"خطا در ذخیره اطلاعات"})
        }


        const user = await LoginAndRegisterModels.getByEmail(email)

        if (!user) {
             return res.status(401).json({message:"خطا در ایمیل"})
        }


        const tokens = await generateAndSaveToken(user)

        return res.status(201).json({
            message:"ثبت نام",
            tokens
        })

    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}


 const login = async(req,res) =>{


         const {error} = validate(loginSchema, req.body)
    

        if (error) {
        return res.status(400).json({message: error.details[0].message})
    }
    

    const {email,password} = req.body



    try {
        

        const user = await LoginAndRegisterModels.getByEmail(email)

        if (!user) {
             return res.status(401).json({message:"خطا دز ایمیل یا پسورد"})
        }


        const IsPassword = await bcrypt.compare(password, user.password)


        if (!IsPassword) {
             return res.status(403).json({message:"خطا در ایمیل یا پسورد"})
        }


        const tokens = await generateAndSaveToken(user)

        return res.status(200).json({
            message:"Login",
            tokens
        })

    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }

}

    const adminlog = async(req,res) =>{

       const {error} = validate(adminlogSchema, req.body)
    

        if (error) {
        return res.status(400).json({message: error.details[0].message})
    }
    
    const {email,password} = req.body

    try {
        
        const user = await LoginAndRegisterModels.getByEmail(email)

        if (!user) {
             return res.status(401).json({message:"خطا دز ایمیل یا پسورد"})
        }

        const IsPassword = await bcrypt.compare(password, user.password)

        if (!IsPassword) {
             return res.status(403).json({message:"خطا در ایمیل یا پسورد"})
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message:"شما اجازه ورود به پنل ادمین را ندارید"
            })
        }

        const tokens = await generateAndSaveToken(user)

        return res.status(200).json({
            message:"ورود",
            tokens
        })

    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }

}

const updateInfo = async(req,res)=>{


    const {error} = validate(updateSchema, req.body)

    if (error) {
        return res.status(400).json({message: error.details[0].message})
    }

    const {id} = req.params

    const {role} = req.body 


    if (req.user.role !== "admin") {
    return res.status(403).json({
        message: "دسترسی ندارید"
    })
}


    try {

        const result = await LoginAndRegisterModels.updateInfo(id,role)

        if (!result) {
            return res.status(404).json({message:"کازیز پسدا نشد"})
        }

        return res.status(200).json({
            message:"آپدیت موفقیت آمیز بود"
        })
        
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }

}

const getMe = async (req, res) => {
    try {

        const user = await LoginAndRegisterModels.getById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "کاربر پیدا نشد"
            });
        }

        return res.status(200).json({
            id: user._id.toString(),
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            role: user.role
        });

    } catch (error) {

        console.error("Error: ", error);

        return res.status(500).json({
            message: "Err in server"
        });
    }
};


module.exports = {
    getAll,register,login,updateInfo,adminlog,getMe
}