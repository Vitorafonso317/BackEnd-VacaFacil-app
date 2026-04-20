const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getMe, updateMe, deleteMe } = require("../controllers/userController");

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.delete("/me", auth, deleteMe);

module.exports = router;
