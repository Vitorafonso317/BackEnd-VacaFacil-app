const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/mlController");

router.use(auth);
router.get("/predict-production", c.predictProduction);
router.get("/analyze-performance", c.analyzePerformance);
router.get("/detect-anomalies", c.detectAnomalies);
router.get("/recommendations", c.recommendations);
router.get("/financial-forecast", c.financialForecast);
router.get("/insights", c.insights);

module.exports = router;
