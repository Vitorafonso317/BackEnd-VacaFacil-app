const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/validateMiddleware");
const c = require("../controllers/marketplaceController");

router.get("/", c.getAll);
router.get("/:id", c.getOne);
router.post("/", auth, rules.marketplace, validate, c.create);
router.put("/:id", auth, rules.marketplace, validate, c.update);
router.delete("/:id", auth, c.remove);

module.exports = router;
