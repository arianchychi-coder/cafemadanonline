const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "public/podcast";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {

    const allowedAudio = [
        "audio/mpeg",     // MP3
        "audio/wav",      // WAV
        "audio/ogg",      // OGG
        "audio/mp4",      // M4A
        "audio/x-m4a"     // M4A
    ];

    const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (file.fieldname === "audio") {

        if (allowedAudio.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed for audio"));
        }

    } else if (file.fieldname === "cover") {

        if (allowedImages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG and WebP images are allowed for cover"));
        }

    } else {
        cb(new Error("Unexpected field"));
    }
};

const upload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 500 * 1024 * 1024
    }
});

module.exports = upload;