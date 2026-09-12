const VisitModel = require("../models/visit_model");

async function createVisit(req, res) {

    try {

        const visit = {

            page: req.body.page,

            ip:
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress,

            userAgent: req.headers["user-agent"],

            referrer: req.get("referer") || "Direct",

            visitTime: new Date()

        };

        await VisitModel.createVisit(visit);

        return res.status(201).json({
            success: true
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false
        });

    }

}



const getChart = async (req,res)=>{

    try {

        const range = req.query.range || "weekly";


        const result = await VisitModel.getChart(range);


        res.json(result);


    } catch(error){

        console.log(error);

        res.status(500).json({
            message:"Chart error"
        });

    }

}


async function stats(req,res){

    try {

        const result = await VisitModel.getStats();

        res.json(result);


    } catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });

    }

}



async function totalVisitors(req,res){

    try {

        const total = await VisitModel.getTotalVisitors();


        res.json({
            total
        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });

    }

}



module.exports = {
    createVisit,
    getChart,
    stats,
    totalVisitors
};