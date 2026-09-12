const express = require("express")
const pageRouter = require("../controllers/page_controller")
const router = express.Router()
router.get("/:id/:name",pageRouter.getPage)
router.get("/admin",pageRouter.getAdminPage)
module.exports = router