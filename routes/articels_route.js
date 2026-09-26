const express = require("express");
const articelsController = require("../controllers/articels_controller");
const upload = require("../middwlwares/upload"); // مسیر را متناسب با پروژه‌ات تنظیم کن'
const authOrizationToken = require("../middwlwares/auth_middelware")
const adminAuthOrization = require("../middwlwares/admin_middelware")

const router = express.Router();

router.get("/", articelsController.getAll);

router.put(
    "/:id",
    authOrizationToken,
    adminAuthOrization,
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

router.delete("/:id",authOrizationToken,
    adminAuthOrization,articelsController.deleteInfo)

router.post("/view/:id",authOrizationToken,
    adminAuthOrization, articelsController.increaseViews);

router.post(
    "/",
authOrizationToken,
    adminAuthOrization,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
        { name: "video", maxCount: 1 }
    ]),
    articelsController.addInfo
);

module.exports = router;