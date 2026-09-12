const jwt = require("jsonwebtoken")
const secretkey = "12345"


const authOrizationToken = async(req,res,next)=>{

    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]


    if (!token) {
        return res.status(401).json({message:"Token isnt find"})
    }


    try {
        
        const user = jwt.verify(token,secretkey)
        req.user = user
        next()

    } catch (error) {
        console.log("Error: ".error)
        return res.status(403).json({message:"Token was invalid.plz login again"})
    }

}

module.exports = authOrizationToken