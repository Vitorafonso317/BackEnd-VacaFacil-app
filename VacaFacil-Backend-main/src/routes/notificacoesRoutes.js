const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/notificacoesController");

router.use(auth);
router.post("/send", c.send);
router.get("/", c.getAll);
router.get("/unread/count", c.getUnreadCount);
router.put("/mark-all-read", c.markAllRead);
router.put("/:id", c.markRead);
router.delete("/:id", c.remove);

module.exports = router;
