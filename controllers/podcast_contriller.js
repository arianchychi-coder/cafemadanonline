const PodcastModel = require("../models/podcast_model");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");


/* =========================
   Validation
========================= */

const postPodcastSchema = Joi.object({
    episod: Joi.string().required(),
    title: Joi.string().min(3).required(),
    time: Joi.string().required(),
    createdAT: Joi.string().required(),
    status: Joi.string().valid("draft", "published")
});


const putPodcastSchema = Joi.object({
    episod: Joi.string().required(),
    title: Joi.string().min(3).required(),
    time: Joi.string().required(),
    createdAT: Joi.string().required(),
    status: Joi.string().valid("draft", "published")
});


const validate = (schema, data) => schema.validate(data);


/* =========================
   Helper
========================= */

const getFile = (files, fieldName) => {
    return files?.[fieldName]?.[0] || null;
};


const deleteFile = (filePath) => {
    if (!filePath) return;

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error("Error deleting file:", error);
    }
};


/* =========================
   GET ALL
========================= */

const getAll = async (req, res) => {

    try {

        const podcast = await PodcastModel.getAll();

        const users = podcast.map(user => ({
            id: user._id.toString(),
            episod: user.episod,
            title: user.title,
            time: user.time,
            audio: user.audio,
            cover: user.cover,
            status: user.status,
            createdAT: user.createdAT
        }));

        res.json(users);

    } catch (error) {

        console.error("Error:", error);

        return res.status(500).json({
            message: "Err in server"
        });
    }
};


/* =========================
   ADD PODCAST
========================= */

const addInfo = async (req, res) => {

    try {

        const { error } = validate(
            postPodcastSchema,
            req.body
        );

        if (error) {

            // اگر validation شکست خورد
            // فایل‌های آپلود شده را حذف کن

            deleteFile(getFile(req.files, "audio")?.path);
            deleteFile(getFile(req.files, "cover")?.path);

            return res.status(400).json({
                message: error.details[0].message
            });
        }


        const {episod,title,time,status,createdAT } = req.body;


        const audioFile = getFile(req.files, "audio");
        const coverFile = getFile(req.files, "cover");


        // Audio اجباری است
        if (!audioFile) {

            deleteFile(coverFile?.path);

            return res.status(400).json({
                message: "audio is required"
            });
        }


        // مسیرهایی که داخل دیتابیس ذخیره می‌شوند

        const audio = `/podcast/${audioFile.filename}`;

        const cover = coverFile
            ? `/podcast/${coverFile.filename}`
            : "";


        const result = await PodcastModel.addInfo(episod,title,time,audio,status,cover,createdAT)
            if (!result) {

            deleteFile(audioFile.path);
            deleteFile(coverFile?.path);

            return res.status(400).json({
                message: "Err in save information"
            });
        }


        return res.status(201).json({
            message: "Podcast add",
            podcast: result
        });


    } catch (error) {

        // اگر خطایی اتفاق افتاد
        // فایل‌های آپلود شده را پاک کن

        deleteFile(getFile(req.files, "audio")?.path);
        deleteFile(getFile(req.files, "cover")?.path);

        console.error("Error:", error);

        return res.status(500).json({
            message: "Err in server"
        });
    }
};


/* =========================
   UPDATE PODCAST
========================= */

const updateInfo = async (req, res) => {

    try {

        const { error } = validate(
            putPodcastSchema,
            req.body
        );

        if (error) {

            deleteFile(getFile(req.files, "audio")?.path);
            deleteFile(getFile(req.files, "cover")?.path);

            return res.status(400).json({
                message: error.details[0].message
            });
        }


        const { id } = req.params;

        const {episod, title, time,status,createdAT} = req.body;


        /* =========================
           Podcast قبلی
        ========================= */

        const oldPodcast = await PodcastModel.getById(id);

        console.log("UPDATE ID:", id);


        if (!oldPodcast) {

            deleteFile(getFile(req.files, "audio")?.path);
            deleteFile(getFile(req.files, "cover")?.path);

            return res.status(404).json({
                message: "پادکست پیدا نشد"
            });
        }


        /* =========================
           فایل‌های جدید
        ========================= */

        const audioFile = getFile(req.files, "audio");
        const coverFile = getFile(req.files, "cover");


        // اگر فایل جدید نیامده
        // فایل قبلی حفظ می‌شود

        let audio = oldPodcast.audio;
        let cover = oldPodcast.cover;


        // اگر Audio جدید آمده
        if (audioFile) {

            audio = `/podcast/${audioFile.filename}`;
        }


        // اگر Cover جدید آمده
        if (coverFile) {

            cover = `/podcast/${coverFile.filename}`;
        }


        /* =========================
           Update Database
        ========================= */

        const result = await PodcastModel.updateInfo( id, episod, title, time, status, audio, cover, createdAT );

        if (!result) {

            deleteFile(audioFile?.path);
            deleteFile(coverFile?.path);

            return res.status(404).json({
                message: "پادکست پیدا نشد"
            });
        }


        /* =========================
           حذف فایل‌های قدیمی
        ========================= */

        if (audioFile && oldPodcast.audio) {

            deleteFile(
                path.join(
                    "public",
                    oldPodcast.audio
                )
            );
        }


        if (coverFile && oldPodcast.cover) {

            deleteFile(
                path.join(
                    "public",
                    oldPodcast.cover
                )
            );
        }


        return res.status(200).json({
            message: "Podcast updated",
            podcast: result
        });


    } catch (error) {

        deleteFile(getFile(req.files, "audio")?.path);
        deleteFile(getFile(req.files, "cover")?.path);

        console.error("Error:", error);

        return res.status(500).json({
            message: "Err in server"
        });
    }
};


/* =========================
   DELETE PODCAST
========================= */

const deleteInfo = async (req, res) => {

    const { id } = req.params;

    try {

        const podcast = await PodcastModel.getById(id);


        if (!podcast) {

            return res.status(404).json({
                message: "پادکست پیدا نشد"
            });
        }


        /* =========================
           حذف Audio
        ========================= */

        if (podcast.audio) {

            deleteFile(
                path.join(
                    "public",
                    podcast.audio
                )
            );
        }


        /* =========================
           حذف Cover
        ========================= */

        if (podcast.cover) {

            deleteFile(
                path.join(
                    "public",
                    podcast.cover
                )
            );
        }


        /* =========================
           حذف Database
        ========================= */

        const result = await PodcastModel.deleteInfo(id);


        if (!result) {

            return res.status(404).json({
                message: "پادکست پیدا نشد"
            });
        }


        return res.status(200).json({
            message: "Podcast deleted"
        });


    } catch (error) {

        console.error("Error:", error);

        return res.status(500).json({
            message: "Err in server"
        });
    }
};


module.exports = {
    getAll,
    addInfo,
    updateInfo,
    deleteInfo
};
