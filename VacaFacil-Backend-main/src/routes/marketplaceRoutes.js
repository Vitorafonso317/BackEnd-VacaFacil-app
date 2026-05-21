const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/validateMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const c = require("../controllers/marketplaceController");

router.get("/meus", auth, c.getMine);
router.get("/", c.getAll);
router.get("/:id", c.getOne);
router.post("/", auth, rules.marketplace, validate, c.create);
router.put("/:id", auth, rules.marketplaceUpdate, validate, c.update);
router.delete("/:id", auth, c.remove);
router.post("/:id/foto", auth, upload.single("foto"), c.uploadFoto);

module.exports = router;
