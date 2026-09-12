const express = require("express")
const router = express.Router()
const requestMadanController = require("../controllers/request_controller")
router.get("/",requestMadanController.getAll)
router.post("/",requestMadanController.addInfo)
router.put( "/:id/status", requestMadanController.updateStatus );
router.delete("/:id",requestMadanController.deleteInfo)
module.exports = router