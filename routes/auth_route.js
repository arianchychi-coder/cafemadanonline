const express = require("express")
const authOrizationToken = require("../middwlwares/auth_middelware")
const router = express.Router()
router.get("/",authOrizationToken,(req,res)=>{
    res.json({message:"Token find",user:req.user})
})
module.exports = router