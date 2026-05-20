const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/database");

async function register(nome, email, password) {
  const existing = await db.get("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) {
    const err = new Error("Email já cadastrado");
    err.status = 409;
    throw err;
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await db.run(
    "INSERT INTO users (nome, email, password) VALUES (?, ?, ?)",
    [nome, email, hash]
  );

  return { id: result.id, nome, email };
}

async function login(email, password) {
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) {
    const err = new Error("Credenciais inválidas");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error("Credenciais inválidas");
    err.status = 401;
    throw err;
  }

  await db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user.id]);

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const planoRow = await db.get(
    `SELECT p.nome FROM assinaturas a JOIN planos p ON p.id = a.plano_id WHERE a.user_id = ? AND a.status = 'ativo'`,
    [user.id]
  );

  return { token, user: { id: user.id, nome: user.nome, email: user.email, foto_url: user.foto_url || null, plano: planoRow?.nome || "Gratuito" } };
}

module.exports = { register, login };
