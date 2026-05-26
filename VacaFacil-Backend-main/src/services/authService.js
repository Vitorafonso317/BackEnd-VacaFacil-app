const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../database/database");

async function sendResetEmail(email, nome, code) {
  if (!process.env.BREVO_API_KEY) {
    const err = new Error("Serviço de e-mail não configurado. Contate o suporte.");
    err.status = 503;
    throw err;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@vacafacil.app";
  const senderName  = process.env.BREVO_SENDER_NAME  || "VacaFácil";

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: "Código para redefinir sua senha — VacaFácil",
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#F9F7F0;border-radius:12px">
          <h2 style="color:#4A7028;margin:0 0 8px">VacaFácil</h2>
          <p style="color:#42473C;margin:0 0 24px">Olá, <strong>${nome}</strong>!</p>
          <p style="color:#42473C;margin:0 0 16px">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p style="color:#42473C;margin:0 0 8px">Use o código abaixo no app. Ele expira em <strong>15 minutos</strong>:</p>
          <div style="background:#fff;border:2px solid #4A7028;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
            <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#4A7028">${code}</span>
          </div>
          <p style="color:#72786A;font-size:13px;margin:16px 0 0">Se não foi você, ignore este e-mail. Sua senha permanece a mesma.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || "Falha ao enviar e-mail.");
    err.status = 502;
    throw err;
  }
}

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

  // Rotaciona: remove o antigo + tokens expirados, emite novo par
  await db.run("DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at <= CURRENT_TIMESTAMP", [row.user_id]);
  await db.run("DELETE FROM refresh_tokens WHERE id = ?", [row.id]);
  const { accessToken, refreshToken: newRefreshToken } = await buildTokenPair(user);

  return { token: accessToken, refreshToken: newRefreshToken };
}

async function forgotPassword(email) {
  const user = await db.get("SELECT id, nome, email FROM users WHERE email = ?", [email]);
  if (!user) return; // resposta idêntica para não revelar se o e-mail existe

  // Remove códigos anteriores desse usuário
  await db.run("DELETE FROM password_reset_tokens WHERE user_id = ?", [user.id]);

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await db.run(
    "INSERT INTO password_reset_tokens (user_id, code, expires_at) VALUES (?, ?, ?)",
    [user.id, code, expiresAt]
  );

  await sendResetEmail(user.email, user.nome, code);
}

async function resetPassword(email, code, newPassword) {
  const user = await db.get("SELECT id FROM users WHERE email = ?", [email]);
  if (!user) {
    const err = new Error("Código inválido ou expirado."); err.status = 400; throw err;
  }

  const row = await db.get(
    "SELECT id FROM password_reset_tokens WHERE user_id = ? AND code = ? AND expires_at > CURRENT_TIMESTAMP AND used = 0",
    [user.id, code]
  );
  if (!row) {
    const err = new Error("Código inválido ou expirado."); err.status = 400; throw err;
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await Promise.all([
    db.run("UPDATE users SET password = ? WHERE id = ?", [hash, user.id]),
    db.run("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [row.id]),
    db.run("DELETE FROM refresh_tokens WHERE user_id = ?", [user.id]), // invalida todas as sessões
  ]);
}

module.exports = { register, login, refresh, forgotPassword, resetPassword };
