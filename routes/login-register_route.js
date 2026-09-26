const express = require("express")
const loginRegisteController = require("../controllers/login-register_controller")
const authOrizationToken = require("../middwlwares/auth_middelware")
const adminAuthOrization = require("../middwlwares/admin_middelware")
const router = express.Router()
router.get("/user",authOrizationToken,loginRegisteController.getAll)
router.get("/me", authOrizationToken, loginRegisteController.getMe);
router.post("/register",loginRegisteController.register)
router.post("/login",loginRegisteController.login)
router.post("/adminlogin",loginRegisteController.adminlog)
router.delete("/userrole/:id",authOrizationToken,adminAuthOrization,loginRegisteController.deleteInfo)
module.exports = router
