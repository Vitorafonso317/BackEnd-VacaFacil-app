const authService = require("../services/authService");
const { ok, created } = require("../middleware/response");

async function register(req, res, next) {
  try {
    const { nome, email, password } = req.body;
    const result = await authService.register(nome, email, password);
    return created(res, result, "Usuário criado com sucesso");
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return ok(res, result, "Login realizado com sucesso");
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "refreshToken é obrigatório." });
    const result = await authService.refresh(refreshToken);
    return ok(res, result, "Token renovado com sucesso");
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh };
