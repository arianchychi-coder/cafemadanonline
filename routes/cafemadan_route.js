const express = require("express")
const router = express.Router()
const cafeMadanController = require("../controllers/cafemadan_controller")
router.get("/",cafeMadanController.getAll)
router.post("/api/call",cafeMadanController.addInfo)
router.put("/:id",cafeMadanController.updateInfo)
router.delete("/:id",cafeMadanController.deleteInfo)
module.exports = router