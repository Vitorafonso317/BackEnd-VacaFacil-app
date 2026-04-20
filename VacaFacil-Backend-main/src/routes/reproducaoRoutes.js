const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/validateMiddleware");
const c = require("../controllers/reproducaoController");

router.use(auth);
router.get("/", c.getAll);
router.post("/", rules.reproducao, validate, c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
