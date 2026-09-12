const ArticelsModel = require("../models/articels_model")
const Joi = require("joi")


const articelsForm = Joi.object({
    title:Joi.string().min(3).required(),
    adress:Joi.string().required(),
    information:Joi.string().min(3).required(),
    date:Joi.string().required(),
    sticker:Joi.string().min(3).required(),
    status:Joi.string().required(),
    txt:Joi.string().required(),
}).unknown(true);


const validate = (schema, data) => schema.validate(data)


const getAll = async(req,res)=>{
    try {
        const articels = await ArticelsModel.getAll()
        const users = articels.map(user=>({
            id:user._id.toString(),
            title:user.title,
            adress:user.adress,
            information:user.information,
            date:user.date,
            sticker:user.sticker,
            status:user.status,
            image:user.image,
            gallery:user.gallery,
            video:user.video,
            txt:user.txt,
            views: user.views || 0
        }))


        res.json(users)
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}



const addInfo = async(req,res)=>{


    const {error} = validate(articelsForm, req.body)

    if (error) {
         return res.status(400).json({message: error.details[0].message})
    }

    const {
    title,
    adress,
    information,
    date,
    sticker,
    status,
    txt
} = req.body;


const image = req.files?.image?.[0]?.filename || "";

const gallery = req.files?.gallery
    ? req.files.gallery.map(file => file.filename)
    : [];

const video = req.files?.video?.[0]?.filename || "";





    try {
        
        const result = await ArticelsModel.addInfo(    title,
    adress,
    information,
    date,
    sticker,
    status,
    image,
    gallery,
    video,
txt)


        if (!result) {
            return res.status(400).json({message:"Err in save info"})
        }


        res.status(201).json({message:"مقاله به موفقیت اضافه شد"})

    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }

}


const updateInfo = async (req, res) => {
    const { id } = req.params;

    const {
        title,
        adress,
        information,
        date,
        txt
    } = req.body;

    const image = req.files?.image?.[0]?.filename || "";
    const video = req.files?.video?.[0]?.filename || "";

    try {
        const result = await ArticelsModel.updateInfo(
            id,
            title,
            adress,
            information,
            date,
            image,
            video,
            txt
        );

        if (!result) {
            return res.status(404).json({
                message: "مقاله پیدا نشد"
            });
        }

        return res.status(200).json({
            message: "مقاله با موفقیت آپدیت شد"
        });

    } catch (error) {
        console.error("Update Error:", error);

        return res.status(500).json({
            message: "خطا در سرور"
        });
    }
};


const deleteInfo = async(req,res)=>{
    const {id} = req.params

    try {
        
        const result = await ArticelsModel.deleteInfo(id)
        
        if (!result) {
            return res.status(404).json({message:"User not find"})
        }

        return res.status(200).json({
            message:"Delete succesfull"
        })
    } catch (error) {
        console.error("Error: ",error)
        return res.status(500).json({message:"Err in server"})
    }
}


const increaseViews = async (req, res) => {
    try {

        const result = await ArticelsModel.increaseViews(req.params.id);

        if (!result) {
            return res.status(404).json({
                message: "مقاله پیدا نشد"
            });
        }

        res.json({
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Err in server"
        });
    }
};

module.exports = {
    getAll,addInfo,increaseViews,updateInfo,deleteInfo
}