const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/relatoriosController");

router.use(auth);
router.get("/producao/json", c.producao);
router.get("/financeiro/json", c.financeiro);
router.get("/completo/json", c.completo);

module.exports = router;
