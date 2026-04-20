const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/assinaturasController");

router.get("/plans", c.getPlans);
router.post("/subscribe", auth, c.subscribe);
router.get("/status", auth, c.getStatus);
router.put("/upgrade", auth, c.upgrade);
router.delete("/cancel", auth, c.cancel);

module.exports = router;
