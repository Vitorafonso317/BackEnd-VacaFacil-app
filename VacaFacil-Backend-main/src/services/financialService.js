const db = require("../database/database");

async function getByTipo(tipo, userId, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, countRow] = await Promise.all([
    db.query(
      "SELECT * FROM financeiro WHERE tipo = ? AND user_id = ? ORDER BY data DESC LIMIT ? OFFSET ?",
      [tipo, userId, limit, offset]
    ),
    db.get(
      "SELECT COUNT(*) as total FROM financeiro WHERE tipo = ? AND user_id = ?",
      [tipo, userId]
    ),
  ]);
  return { rows, total: countRow.total };
}

async function create(tipo, data, userId) {
  const { descricao, valor, data: date } = data;
  const result = await db.run(
    "INSERT INTO financeiro (tipo, descricao, valor, data, user_id) VALUES (?, ?, ?, ?, ?)",
    [tipo, descricao, valor, date, userId]
  );
  return { id: result.id, tipo, descricao, valor, data: date };
}

async function update(id, tipo, data, userId) {
  const { descricao, valor, data: date } = data;
  const fields = [];
  const values = [];

  if (descricao) { fields.push("descricao = ?"); values.push(descricao); }
  if (valor !== undefined) { fields.push("valor = ?"); values.push(valor); }
  if (date) { fields.push("data = ?"); values.push(date); }

  if (!fields.length) {
    const err = new Error("Nenhum campo para atualizar");
    err.status = 400;
    throw err;
  }

  values.push(id, userId, tipo);
  const result = await db.run(
    `UPDATE financeiro SET ${fields.join(", ")} WHERE id = ? AND user_id = ? AND tipo = ?`,
    values
  );
  if (!result.changes) {
    const err = new Error("Registro não encontrado");
    err.status = 404;
    throw err;
  }
}

async function remove(id, tipo, userId) {
  const result = await db.run(
    "DELETE FROM financeiro WHERE id = ? AND user_id = ? AND tipo = ?",
    [id, userId, tipo]
  );
  if (!result.changes) {
    const err = new Error("Registro não encontrado");
    err.status = 404;
    throw err;
  }
}

module.exports = { getByTipo, create, update, remove };
