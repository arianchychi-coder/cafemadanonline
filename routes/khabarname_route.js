const express = require("express")
const khabarnameController = require("../controllers/Khabarname_controller")
const upload = require("../middwlwares/khabarname_middelware")
const router = express.Router()
router.get("/",khabarnameController.getAll)
router.post("/khabarname",upload.fields([{name:"image" , maxCount:1}]),khabarnameController.addInfo)
router.put("/:id",upload.fields([{name:"image" , maxCount:1}]),khabarnameController.updateInfo)
router.delete("/:id",khabarnameController.deleteInfo)
module.exports = router