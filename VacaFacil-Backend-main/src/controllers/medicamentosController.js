const db = require("../database/database");
const { ok, created, noData, paginated } = require("../middleware/response");

// Retorna todos os tratamentos do usuário; ?ativo=true filtra apenas os em carência
async function getAll(req, res, next) {
  try {
    const apenasAtivos = req.query.ativo === "true";
    const vacaId = req.query.vaca_id ? parseInt(req.query.vaca_id) : null;

    let sql = `
      SELECT m.*, v.nome AS vaca_nome,
        DATE(m.data_aplicacao, '+' || m.dias_carencia || ' days') AS data_fim_carencia
      FROM medicamentos_tratamentos m
      JOIN vacas v ON m.vaca_id = v.id
      WHERE m.user_id = ?`;
    const params = [req.user.id];

    if (vacaId) { sql += " AND m.vaca_id = ?"; params.push(vacaId); }
    if (apenasAtivos) { sql += " AND DATE('now') <= DATE(m.data_aplicacao, '+' || m.dias_carencia || ' days')"; }

    sql += " ORDER BY m.data_aplicacao DESC";

    const rows = await db.query(sql, params);
    return ok(res, rows, "Lista de tratamentos");
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { vaca_id, nome_medicamento, data_aplicacao, dias_carencia, observacoes } = req.body;

    if (!vaca_id || !nome_medicamento || !data_aplicacao || !dias_carencia) {
      return res.status(400).json({ success: false, message: "Campos obrigatórios: vaca_id, nome_medicamento, data_aplicacao, dias_carencia" });
    }

    const vaca = await db.get("SELECT id FROM vacas WHERE id = ? AND user_id = ?", [vaca_id, req.user.id]);
    if (!vaca) return res.status(404).json({ success: false, message: "Vaca não encontrada" });

    const result = await db.run(
      "INSERT INTO medicamentos_tratamentos (vaca_id, user_id, nome_medicamento, data_aplicacao, dias_carencia, observacoes) VALUES (?, ?, ?, ?, ?, ?)",
      [vaca_id, req.user.id, nome_medicamento, data_aplicacao, parseInt(dias_carencia), observacoes || null]
    );

    const created_rec = await db.get(
      `SELECT m.*, v.nome AS vaca_nome,
         DATE(m.data_aplicacao, '+' || m.dias_carencia || ' days') AS data_fim_carencia
       FROM medicamentos_tratamentos m JOIN vacas v ON m.vaca_id = v.id
       WHERE m.id = ?`,
      [result.id]
    );

    return created(res, created_rec, "Tratamento registrado com sucesso");
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await db.run(
      "DELETE FROM medicamentos_tratamentos WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Registro não encontrado" });
    return noData(res, "Tratamento removido com sucesso");
  } catch (err) { next(err); }
}

// Verifica se uma vaca está em carência ativa (usado internamente pelo productionController)
async function checkCarencia(vacaId, userId) {
  return db.get(
    `SELECT id, nome_medicamento, dias_carencia, data_aplicacao,
       DATE(data_aplicacao, '+' || dias_carencia || ' days') AS data_fim_carencia
     FROM medicamentos_tratamentos
     WHERE vaca_id = ? AND user_id = ?
       AND DATE('now') <= DATE(data_aplicacao, '+' || dias_carencia || ' days')
     ORDER BY data_aplicacao DESC LIMIT 1`,
    [vacaId, userId]
  );
}

module.exports = { getAll, create, remove, checkCarencia };
