const express = require("express")
const router = express.Router()
const settingController = require("../controllers/setting_controller")
router.get("/",settingController.getAll)
router.post("/",settingController.addInfo)
router.put("/:id",settingController.updatePassword)
module.exports= router