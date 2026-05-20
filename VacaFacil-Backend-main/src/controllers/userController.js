const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const db = require("../database/database");
const { ok, noData } = require("../middleware/response");

const USER_SELECT = `
  SELECT u.id, u.nome, u.email, u.foto_url, u.created_at, u.last_login,
         COALESCE(p.nome, 'Gratuito') as plano
  FROM users u
  LEFT JOIN assinaturas a ON a.user_id = u.id AND a.status = 'ativo'
  LEFT JOIN planos p ON p.id = a.plano_id
  WHERE u.id = ?`;

async function getMe(req, res, next) {
  try {
    const user = await db.get(USER_SELECT, [req.user.id]);
    if (!user) return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    return ok(res, user, "Dados do usuário");
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    const { nome, email, password } = req.body;
    const fields = [];
    const values = [];

    if (nome) { fields.push("nome = ?"); values.push(nome); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (password) { fields.push("password = ?"); values.push(await bcrypt.hash(password, 10)); }

    if (!fields.length) return res.status(400).json({ success: false, message: "Nenhum campo para atualizar" });

    values.push(req.user.id);
    await db.run(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    const updated = await db.get(USER_SELECT, [req.user.id]);
    return ok(res, updated, "Usuário atualizado com sucesso");
  } catch (err) { next(err); }
}

async function uploadFoto(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error("Nenhuma imagem enviada");
      err.status = 400;
      throw err;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fotoUrl = `${baseUrl}/uploads/usuarios/${req.file.filename}`;

    // Remove foto antiga se existir
    const user = await db.get("SELECT foto_url FROM users WHERE id = ?", [req.user.id]);
    if (user?.foto_url) {
      const oldFile = path.resolve(__dirname, "../uploads/usuarios", path.basename(user.foto_url));
      fs.unlink(oldFile, () => {});
    }

    await db.run("UPDATE users SET foto_url = ? WHERE id = ?", [fotoUrl, req.user.id]);
    return ok(res, { foto_url: fotoUrl }, "Foto atualizada com sucesso");
  } catch (err) { next(err); }
}

async function deleteMe(req, res, next) {
  try {
    await db.run("DELETE FROM users WHERE id = ?", [req.user.id]);
    return noData(res, "Conta excluída com sucesso");
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, uploadFoto, deleteMe };
