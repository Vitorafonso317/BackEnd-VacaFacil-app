const { body, validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
}

const rules = {
  register: [
    body("nome").trim().notEmpty().withMessage("nome é obrigatório"),
    body("email").isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("senha deve ter no mínimo 6 caracteres"),
  ],
  login: [
    body("email").isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").notEmpty().withMessage("password é obrigatório"),
  ],
  vaca: [
    body("nome").trim().notEmpty().withMessage("nome é obrigatório"),
    body("idade").optional().isInt({ min: 0 }).withMessage("idade deve ser um número inteiro positivo"),
    body("peso").optional().isFloat({ min: 0 }).withMessage("peso deve ser um número positivo"),
  ],
  producao: [
    body("vaca_id").isInt({ min: 1 }).withMessage("vaca_id inválido"),
    body("data").isDate().withMessage("data inválida"),
    body("litros").isFloat({ min: 0.01 }).withMessage("litros deve ser maior que zero"),
  ],
  financeiro: [
    body("descricao").trim().notEmpty().withMessage("descricao é obrigatória"),
    body("valor").isFloat({ min: 0.01 }).withMessage("valor deve ser positivo"),
    body("data").isDate().withMessage("data inválida"),
  ],
  reproducao: [
    body("vaca_id").isInt({ min: 1 }).withMessage("vaca_id inválido"),
    body("tipo_evento").trim().notEmpty().withMessage("tipo_evento é obrigatório"),
    body("data").isDate().withMessage("data inválida"),
  ],
  marketplace: [
    body("titulo").trim().notEmpty().withMessage("titulo é obrigatório"),
    body("preco").isFloat({ min: 0 }).withMessage("preco deve ser um número positivo"),
  ],
};

module.exports = { validate, rules };
