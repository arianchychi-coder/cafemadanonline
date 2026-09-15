const express = require("express")
const pageRouter = require("../controllers/page_controller")
const router = express.Router()
router.get("/:id/:name",pageRouter.getPage)
module.exports = router