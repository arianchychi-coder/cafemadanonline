require("dotenv").config()
const path = require("path")

const express = require("express")
const cafeMadanRouter = require("./routes/cafemadan_route")
const adminRouter = require("./routes/admin_route")
const visitRouter = require("./routes/visit_route")
const requestRouter = require("./routes/request_route")
const pageRouter = require("./routes/page_route")
const articelsRouter = require("./routes/articels_route")
const settingRouter = require("./routes/setting_route")
const loginRegisterRouter = require("./routes/login-register_route")
const authRouter = require("./routes/auth_route")
const podcastRouter = require("./routes/podcast_route")
const khabarnameRouter = require("./routes/khabarname_route")
const adminpageRoutr = require("./routes/adminpage_route")

const app = express()

app.use(express.static(path.join(__dirname , "public/podcast")))
app.use(express.static(path.join(__dirname, "public/khabarname")))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use("/",cafeMadanRouter)
app.use("/api/admin",adminRouter)
app.use("/api/visit", visitRouter);
app.use("/api/request", requestRouter);
app.use("/cafemadan",pageRouter)
app.use("/api/articels",articelsRouter)
app.use("/api/setting",settingRouter)
app.use("/",loginRegisterRouter)
app.use("/api/protected",authRouter)
app.use("/api/podcast",podcastRouter)
app.use("/",khabarnameRouter)
app.use("/admin",adminpageRoutr)
const PORT = process.env.APP_PORT
app.listen(PORT , ()=>{
    console.log(`Listen to ${PORT}`)
})