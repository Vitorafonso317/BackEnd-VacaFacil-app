const db = require("../database/database");

async function getAll(userId, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, countRow] = await Promise.all([
    db.query(
      `SELECT p.* FROM producao p
       JOIN vacas v ON p.vaca_id = v.id
       WHERE v.user_id = ?
       ORDER BY p.data DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    ),
    db.get(
      `SELECT COUNT(*) as total FROM producao p
       JOIN vacas v ON p.vaca_id = v.id WHERE v.user_id = ?`,
      [userId]
    ),
  ]);
  return { rows, total: countRow.total };
}

async function create(data, userId) {
  const { vaca_id, data: date, litros, observacoes } = data;
  const vaca = await db.get("SELECT id FROM vacas WHERE id = ? AND user_id = ?", [vaca_id, userId]);
  if (!vaca) {
    const err = new Error("Vaca não encontrada");
    err.status = 404;
    throw err;
  }
  const result = await db.run(
    "INSERT INTO producao (vaca_id, data, litros, observacoes) VALUES (?, ?, ?, ?)",
    [vaca_id, date, litros, observacoes || null]
  );
  return { id: result.id, vaca_id, data: date, litros, observacoes };
}

async function update(id, data, userId) {
  const { data: date, litros, observacoes } = data;
  const fields = [];
  const values = [];

  if (date) { fields.push("data = ?"); values.push(date); }
  if (litros !== undefined) { fields.push("litros = ?"); values.push(litros); }
  if (observacoes !== undefined) { fields.push("observacoes = ?"); values.push(observacoes); }

  if (!fields.length) {
    const err = new Error("Nenhum campo para atualizar");
    err.status = 400;
    throw err;
  }

  values.push(id);
  const result = await db.run(
    `UPDATE producao SET ${fields.join(", ")} WHERE id = ? AND vaca_id IN (SELECT id FROM vacas WHERE user_id = ?)`,
    [...values, userId]
  );
  if (!result.changes) {
    const err = new Error("Registro não encontrado");
    err.status = 404;
    throw err;
  }
}

async function remove(id, userId) {
  const result = await db.run(
    `DELETE FROM producao WHERE id = ? AND vaca_id IN (SELECT id FROM vacas WHERE user_id = ?)`,
    [id, userId]
  );
  if (!result.changes) {
    const err = new Error("Registro não encontrado");
    err.status = 404;
    throw err;
  }
}

module.exports = { getAll, create, update, remove };
