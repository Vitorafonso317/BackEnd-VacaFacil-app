const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/medicamentosController");

router.use(auth);
router.get("/", c.getAll);
router.post("/", c.create);
router.delete("/:id", c.remove);

module.exports = router;
