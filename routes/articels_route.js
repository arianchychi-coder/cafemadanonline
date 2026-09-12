const express = require("express");
const articelsController = require("../controllers/articels_controller");
const upload = require("../middwlwares/upload"); // مسیر را متناسب با پروژه‌ات تنظیم کن

const router = express.Router();

router.get("/", articelsController.getAll);

router.put(
    "/:id",

    (req, res, next) => {
        console.log("PUT ARTICLE:", req.params.id);
        next();
    },

    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
        { name: "video", maxCount: 1 }
    ]),

    articelsController.updateInfo
);

router.delete("/:id",articelsController.deleteInfo)

router.post("/view/:id", articelsController.increaseViews);

router.post(
    "/",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
        { name: "video", maxCount: 1 }
    ]),
    articelsController.addInfo
);

module.exports = router;