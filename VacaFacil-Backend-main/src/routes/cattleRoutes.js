const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/validateMiddleware");
const upload = require("../middleware/uploadMiddleware");
const c = require("../controllers/cattleController");

router.use(auth);
router.get("/", c.getAll);
router.post("/", rules.vaca, validate, c.create);
router.get("/:id", c.getOne);
router.put("/:id", rules.vaca, validate, c.update);
router.delete("/:id", c.remove);
router.post("/:id/foto", upload.single("foto"), c.uploadFoto);

module.exports = router;
