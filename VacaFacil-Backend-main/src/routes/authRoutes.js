const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { register, login, refresh } = require("../controllers/authController");
const { validate, rules } = require("../middleware/validateMiddleware");

const authLimiter = process.env.NODE_ENV === "test"
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
    });

router.post("/register", authLimiter, rules.register, validate, register);
router.post("/login",    authLimiter, rules.login,    validate, login);
router.post("/refresh",  authLimiter, refresh);

module.exports = router;
