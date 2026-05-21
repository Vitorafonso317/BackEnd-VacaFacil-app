const db = require("../database/database");

async function getAll(userId, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, countRow] = await Promise.all([
    db.query("SELECT * FROM vacas WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", [userId, limit, offset]),
    db.get("SELECT COUNT(*) as total FROM vacas WHERE user_id = ?", [userId]),
  ]);
  return { rows, total: countRow.total };
}

async function getOne(id, userId) {
  const vaca = await db.get("SELECT * FROM vacas WHERE id = ? AND user_id = ?", [id, userId]);
  if (!vaca) {
    const err = new Error("Vaca não encontrada");
    err.status = 404;
    throw err;
  }
  return vaca;
}

async function create(data, userId) {
  const { nome, raca, idade, peso, status_saude } = data;
  const result = await db.run(
    "INSERT INTO vacas (nome, raca, idade, peso, status_saude, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    [nome, raca || null, idade || null, peso || null, status_saude || "saudavel", userId]
  );
  return { id: result.id, nome, raca, idade, peso, status_saude };
}

async function update(id, data, userId) {
  const { nome, raca, idade, peso, status_saude } = data;
  const fields = [];
  const values = [];

  if (nome) { fields.push("nome = ?"); values.push(nome); }
  if (raca !== undefined) { fields.push("raca = ?"); values.push(raca); }
  if (idade !== undefined) { fields.push("idade = ?"); values.push(idade); }
  if (peso !== undefined) { fields.push("peso = ?"); values.push(peso); }
  if (status_saude) { fields.push("status_saude = ?"); values.push(status_saude); }

  if (!fields.length) {
    const err = new Error("Nenhum campo para atualizar");
    err.status = 400;
    throw err;
  }

  values.push(id, userId);
  const result = await db.run(
    `UPDATE vacas SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    values
  );
  if (!result.changes) {
    const err = new Error("Vaca não encontrada");
    err.status = 404;
    throw err;
  }
}

async function remove(id, userId) {
  const vaca = await db.get("SELECT id FROM vacas WHERE id = ? AND user_id = ?", [id, userId]);
  if (!vaca) {
    const err = new Error("Vaca não encontrada");
    err.status = 404;
    throw err;
  }

  const result = await db.run("DELETE FROM vacas WHERE id = ? AND user_id = ?", [id, userId]);
  if (!result.changes) {
    const err = new Error("Vaca não encontrada");
    err.status = 404;
    throw err;
  }
}

async function updateFoto(id, fotoUrl, userId) {
  const result = await db.run(
    "UPDATE vacas SET foto_url = ? WHERE id = ? AND user_id = ?",
    [fotoUrl, id, userId]
  );
  if (!result.changes) {
    const err = new Error("Vaca não encontrada");
    err.status = 404;
    throw err;
  }
}

module.exports = { getAll, getOne, create, update, remove, updateFoto };
