const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getMe, updateMe, uploadFoto, deleteMe } = require("../controllers/userController");
const { validate, rules } = require("../middleware/validateMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

router.get("/me", auth, getMe);
router.put("/me", auth, rules.user, validate, updateMe);
router.post("/me/foto", auth, upload.single("foto"), uploadFoto);
router.delete("/me", auth, deleteMe);

module.exports = router;
