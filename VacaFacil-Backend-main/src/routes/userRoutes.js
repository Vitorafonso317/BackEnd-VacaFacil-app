const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getMe, updateMe, uploadFoto, deleteMe } = require("../controllers/userController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.resolve(__dirname, "../uploads/usuarios");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Apenas imagens JPG, PNG ou WEBP"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.post("/me/foto", auth, upload.single("foto"), uploadFoto);
router.delete("/me", auth, deleteMe);

module.exports = router;
