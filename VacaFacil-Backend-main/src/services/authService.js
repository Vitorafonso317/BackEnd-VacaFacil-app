const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../database/database");

const REFRESH_EXPIRY_DAYS = 30;

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_EXPIRY_DAYS);
  return d.toISOString();
}

async function buildTokenPair(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  const refreshToken = generateRefreshToken();
  await db.run(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [user.id, refreshToken, refreshExpiresAt()]
  );
  return { accessToken, refreshToken };
}

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

  const { accessToken, refreshToken } = await buildTokenPair(user);

  const planoRow = await db.get(
    `SELECT p.nome FROM assinaturas a JOIN planos p ON p.id = a.plano_id WHERE a.user_id = ? AND a.status = 'ativo'`,
    [user.id]
  );

  return {
    token: accessToken,
    refreshToken,
    user: { id: user.id, nome: user.nome, email: user.email, foto_url: user.foto_url || null, plano: planoRow?.nome || "Gratuito" },
  };
}

async function refresh(refreshToken) {
  const row = await db.get(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > CURRENT_TIMESTAMP",
    [refreshToken]
  );
  if (!row) {
    const err = new Error("Refresh token inválido ou expirado. Faça login novamente.");
    err.status = 401;
    throw err;
  }

  const user = await db.get("SELECT * FROM users WHERE id = ?", [row.user_id]);
  if (!user) {
    const err = new Error("Usuário não encontrado.");
    err.status = 401;
    throw err;
  }

  // Rotaciona: remove o antigo, emite novo par
  await db.run("DELETE FROM refresh_tokens WHERE id = ?", [row.id]);
  const { accessToken, refreshToken: newRefreshToken } = await buildTokenPair(user);

  return { token: accessToken, refreshToken: newRefreshToken };
}

module.exports = { register, login, refresh };
