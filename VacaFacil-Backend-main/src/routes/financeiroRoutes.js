const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/validateMiddleware");
const c = require("../controllers/financeiroController");

router.use(auth);
router.get("/resumo", c.getResumo);
router.get("/receitas", c.getReceitas);
router.post("/receitas", rules.financeiro, validate, c.createReceita);
router.put("/receitas/:id", rules.financeiro, validate, c.updateReceita);
router.delete("/receitas/:id", c.deleteReceita);

router.get("/despesas", c.getDespesas);
router.post("/despesas", rules.financeiro, validate, c.createDespesa);
router.put("/despesas/:id", rules.financeiro, validate, c.updateDespesa);
router.delete("/despesas/:id", c.deleteDespesa);

module.exports = router;
