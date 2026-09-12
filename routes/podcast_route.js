const express = require("express")
const podcastController = require("../controllers/podcast_contriller")
const upload = require("../middwlwares/podcast_middelware")
const router = express.Router()
router.get("/",podcastController.getAll)
router.post("/",upload.fields([{ name: "audio", maxCount: 1 },{ name: "cover", maxCount: 1 }]),podcastController.addInfo)
router.put("/:id",upload.fields([{ name: "audio", maxCount: 1 },{ name: "cover", maxCount: 1 }]),podcastController.updateInfo)
router.delete("/:id",podcastController.deleteInfo)
module.exports = router