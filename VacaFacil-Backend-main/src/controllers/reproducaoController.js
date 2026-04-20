const db = require("../database/database");
const { ok, created, noData, paginated } = require("../middleware/response");

async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const [rows, countRow] = await Promise.all([
      db.query(
        `SELECT r.* FROM reproducao r
         JOIN vacas v ON r.vaca_id = v.id
         WHERE v.user_id = ? ORDER BY r.data DESC LIMIT ? OFFSET ?`,
        [req.user.id, limit, offset]
      ),
      db.get(
        `SELECT COUNT(*) as total FROM reproducao r
         JOIN vacas v ON r.vaca_id = v.id WHERE v.user_id = ?`,
        [req.user.id]
      ),
    ]);
    return paginated(res, rows, countRow.total, page, limit, "Lista de reprodução");
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { vaca_id, tipo_evento, data, observacoes } = req.body;
    const vaca = await db.get("SELECT id FROM vacas WHERE id = ? AND user_id = ?", [vaca_id, req.user.id]);
    if (!vaca) return res.status(404).json({ success: false, message: "Vaca não encontrada" });

    const result = await db.run(
      "INSERT INTO reproducao (vaca_id, tipo_evento, data, observacoes) VALUES (?, ?, ?, ?)",
      [vaca_id, tipo_evento, data, observacoes || null]
    );
    return created(res, { id: result.id, vaca_id, tipo_evento, data, observacoes }, "Evento registrado com sucesso");
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { tipo_evento, data, observacoes } = req.body;
    const fields = [];
    const values = [];

    if (tipo_evento) { fields.push("tipo_evento = ?"); values.push(tipo_evento); }
    if (data) { fields.push("data = ?"); values.push(data); }
    if (observacoes !== undefined) { fields.push("observacoes = ?"); values.push(observacoes); }

    if (!fields.length) return res.status(400).json({ success: false, message: "Nenhum campo para atualizar" });

    values.push(req.params.id, req.user.id);
    const result = await db.run(
      `UPDATE reproducao SET ${fields.join(", ")} WHERE id = ? AND vaca_id IN (SELECT id FROM vacas WHERE user_id = ?)`,
      values
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Registro não encontrado" });
    return noData(res, "Reprodução atualizada com sucesso");
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await db.run(
      `DELETE FROM reproducao WHERE id = ? AND vaca_id IN (SELECT id FROM vacas WHERE user_id = ?)`,
      [req.params.id, req.user.id]
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Registro não encontrado" });
    return noData(res, "Reprodução removida com sucesso");
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove };
