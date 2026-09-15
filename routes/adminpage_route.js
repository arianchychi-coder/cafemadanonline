const express = require("express")
const pageRouter = require("../controllers/adminpage_controller")
const router = express.Router()
router.get("/",pageRouter.getAdminPage)
module.exports = router