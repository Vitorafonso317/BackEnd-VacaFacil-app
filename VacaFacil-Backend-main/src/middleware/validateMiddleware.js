const { body, validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
}

function notFuture(value) {
  const today = new Date().toISOString().split("T")[0];
  if (value > today) throw new Error("data não pode ser no futuro");
  return true;
}

const rules = {
  register: [
    body("nome").trim().notEmpty().withMessage("nome é obrigatório")
      .isLength({ max: 255 }).withMessage("nome deve ter no máximo 255 caracteres"),
    body("email").isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("senha deve ter no mínimo 6 caracteres"),
  ],
  login: [
    body("email").isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").notEmpty().withMessage("password é obrigatório"),
  ],
  vaca: [
    body("nome").trim().notEmpty().withMessage("nome é obrigatório")
      .isLength({ max: 255 }).withMessage("nome deve ter no máximo 255 caracteres"),
    body("raca").optional().trim()
      .isLength({ max: 255 }).withMessage("raca deve ter no máximo 255 caracteres"),
    body("idade").optional().isInt({ min: 0 }).withMessage("idade deve ser um número inteiro positivo"),
    body("peso").optional().isFloat({ min: 0 }).withMessage("peso deve ser um número positivo"),
    body("status_saude").optional()
      .isIn(["saudavel", "seca", "tratamento"])
      .withMessage("status_saude deve ser: saudavel, seca ou tratamento"),
  ],
  producao: [
    body("vaca_id").isInt({ min: 1 }).withMessage("vaca_id inválido"),
    body("data").isDate().withMessage("data inválida").bail().custom(notFuture),
    body("litros").isFloat({ min: 0.01, max: 500 }).withMessage("litros deve ser entre 0.01 e 500"),
  ],
  financeiro: [
    body("descricao").trim().notEmpty().withMessage("descricao é obrigatória")
      .isLength({ max: 500 }).withMessage("descricao deve ter no máximo 500 caracteres"),
    body("valor").isFloat({ min: 0.01 }).withMessage("valor deve ser positivo"),
    body("data").isDate().withMessage("data inválida").bail().custom(notFuture),
  ],
  reproducao: [
    body("vaca_id").isInt({ min: 1 }).withMessage("vaca_id inválido"),
    body("tipo_evento").trim().notEmpty().withMessage("tipo_evento é obrigatório"),
    body("data").isDate().withMessage("data inválida"),
  ],
  marketplace: [
    body("titulo").trim().notEmpty().withMessage("titulo é obrigatório")
      .isLength({ max: 255 }).withMessage("titulo deve ter no máximo 255 caracteres"),
    body("descricao").optional().trim()
      .isLength({ max: 2000 }).withMessage("descricao deve ter no máximo 2000 caracteres"),
    body("preco").isFloat({ min: 0.01 }).withMessage("preco deve ser maior que zero"),
    body("categoria").optional()
      .isIn(["Bovino"])
      .withMessage("categoria deve ser: Bovino"),
  ],
  marketplaceUpdate: [
    body("titulo").optional().trim()
      .isLength({ min: 1, max: 255 }).withMessage("titulo deve ter entre 1 e 255 caracteres"),
    body("descricao").optional().trim()
      .isLength({ max: 2000 }).withMessage("descricao deve ter no máximo 2000 caracteres"),
    body("preco").optional().isFloat({ min: 0.01 }).withMessage("preco deve ser maior que zero"),
    body("categoria").optional()
      .isIn(["Bovino"])
      .withMessage("categoria deve ser: Bovino"),
  ],
  forgotPassword: [
    body("email").isEmail().withMessage("e-mail inválido").normalizeEmail(),
  ],
  resetPassword: [
    body("email").isEmail().withMessage("e-mail inválido").normalizeEmail(),
    body("code").trim().isLength({ min: 6, max: 6 }).withMessage("código deve ter 6 dígitos")
      .isNumeric().withMessage("código deve conter apenas números"),
    body("password").isLength({ min: 6 }).withMessage("senha deve ter no mínimo 6 caracteres"),
  ],
  user: [
    body("nome").optional().trim()
      .isLength({ min: 1, max: 255 }).withMessage("nome deve ter entre 1 e 255 caracteres"),
    body("email").optional().isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").optional()
      .isLength({ min: 6 }).withMessage("senha deve ter no mínimo 6 caracteres"),
  ],
};

module.exports = { validate, rules };
