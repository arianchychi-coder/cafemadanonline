const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (file.fieldname === "video") {
            cb(null, "public/videos");
        } else {
            cb(null, "public/images");
        }

    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")
    ) {
        cb(null, true);
    } else {
        cb(new Error("فقط عکس و ویدیو مجاز است."));
    }
};

module.exports = multer({ storage, fileFilter });