const express = require("express");

const router = express.Router();

const VisitController = require("../controllers/visit_controller");

router.post("/", VisitController.createVisit);
router.get("/chart", VisitController.getChart);




router.get("/stats",VisitController.stats);
router.get("/total", VisitController.totalVisitors);

module.exports = router;