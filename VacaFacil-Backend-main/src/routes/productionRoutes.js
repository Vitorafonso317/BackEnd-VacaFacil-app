const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/validateMiddleware");
const c = require("../controllers/productionController");

router.use(auth);
router.get("/variacao", c.getDailyVariation);
router.get("/", c.getAll);
router.post("/", rules.producao, validate, c.create);
router.put("/:id", rules.producao, validate, c.update);
router.delete("/:id", c.remove);

module.exports = router;
