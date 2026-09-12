const SettingModel = require("../models/setting_model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken")
const secretkey = "12345"
const crypto = require("crypto")


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "arianchychi@gmail.com",
        pass: "fspumbtbcmdwqqrf"
    },
    tls: {
        rejectUnauthorized: false
    }
});



const generateAndSaveToken = async(user)=>{
    const accessToken = jwt.sign({
        id:user._id,
        name:user.name,
        role:user.role
    },secretkey,{expiresIn:"1h"})

    const refreshToken = crypto.randomBytes(32).toString('hex')
    const hashRefreshToken = await bcrypt.hash(refreshToken, 10)
    const update = await SettingModel.updateRefreshToken(user._id.toString(),hashRefreshToken)
    if (!update) {
        throw new Error("Fail to update refresh token in database")
    }

    return{accessToken,refreshToken}
}


const getAll = async (req, res) => {
    try {
        const setting = await SettingModel.getAll();

        const users = setting.map(user => ({
            name: user.name
        }));

        return res.json(users);

    } catch (error) {
        console.error("Error:", error);

        return res.status(500).json({
            message: "خطا در سرور"
        });
    }
};


const addInfo = async (req, res) => {
    try {

        const { name, password} = req.body;

        if (!name || !password) {
            return res.status(400).json({
                message: "نام کاربری و رمز عبور الزامی است"
            });
        }

        // هش کردن رمز
        const hashPassword = await bcrypt.hash(password, 10);

        console.log("HASH PASSWORD:", hashPassword);

        const result = await SettingModel.addInfo(
            name,
            hashPassword
        );

        if (!result) {
            return res.status(500).json({
                message: "خطا در ثبت ادمین"
            });
        }

        const user = await SettingModel.getByName(name)

        if (!name) {
            return res.status(403).json({
                message: "خطا در ثبت نام"
            });
        }

         await transporter.sendMail({
            from: "arianchychi@gmail.com",
            to: "arianchychi@gmail.com",
            subject: "ادمین جدید",
            text: `ادمین جدید ایجاد شد.

نام کاربری: ${name}

زمان:
${new Date().toLocaleString("fa-IR")}`
        });


        const tokens = await generateAndSaveToken(user)

        return res.status(201).json({
            message: "ادمین با موفقیت ثبت شد",
            id:user._id,
            name:user.name,
            tokens
        });

    } catch (error) {

        console.error("Add Admin Error:", error);

        return res.status(500).json({
            message: "خطا در سرور"
        });
    }
};


const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({
                message: "نام کاربری و رمز عبور الزامی است"
            });
        }

        const user = await SettingModel.getByName(name);

        if (!user) {
            return res.status(401).json({
                message: "نام کاربری یا رمز عبور اشتباه است"
            });
        }

        // چون این فرم فقط برای ادمین است
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "این حساب اجازه ورود به پنل ادمین را ندارد"
            });
        }

        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "نام کاربری یا رمز عبور اشتباه است"
            });
        }

        const tokens = await generateAndSaveToken(user);

        return res.status(200).json({
            message: "ورود موفق",
            id: user._id,
            name: user.name,
            role: user.role,
            tokens
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "خطا در سرور"
        });
    }
};


const updatePassword = async (req, res) => {

    try {

        const { newpassword, confirmpassword } = req.body;

        const id = req.params.id;


        if (req.user.role !== "admin" || req.user.id !== id) {
            return res.status(403).json({message:"Access denied"})
        }

        // بررسی خالی نبودن
        if (!newpassword || !confirmpassword) {
            return res.status(400).json({
                message: "رمز عبور جدید و تکرار آن الزامی است"
            });
        }

        // بررسی یکسان بودن
        if (newpassword !== confirmpassword) {
            return res.status(400).json({
                message: "رمزهای عبور یکسان نیستند"
            });
        }

        // Hash کردن رمز جدید
        const hashPassword = await bcrypt.hash(
            newpassword,
            10
        );

        // آپدیت پسورد
        const result = await SettingModel.updateInfo(
            id,
            hashPassword
        );

        if (!result) {
            return res.status(404).json({
                message: "ادمین پیدا نشد"
            });
        }

        return res.status(200).json({
            message: "رمز عبور با موفقیت تغییر کرد"
        });

    } catch (error) {

        console.error("Update Password Error:", error);

        return res.status(500).json({
            message: "خطا در سرور"
        });
    }
};


module.exports = {
    getAll,
    addInfo,
    updatePassword,
    login
};