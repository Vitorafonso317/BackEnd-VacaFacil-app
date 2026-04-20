const db = require("../database/database");
const { ok, created, noData, paginated } = require("../middleware/response");

async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const [rows, countRow] = await Promise.all([
      db.query(
        "SELECT * FROM notificacoes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [req.user.id, limit, offset]
      ),
      db.get("SELECT COUNT(*) as total FROM notificacoes WHERE user_id = ?", [req.user.id]),
    ]);
    return paginated(res, rows, countRow.total, page, limit, "Lista de notificações");
  } catch (err) { next(err); }
}

async function getUnreadCount(req, res, next) {
  try {
    const row = await db.get(
      "SELECT COUNT(*) as count FROM notificacoes WHERE user_id = ? AND lida = 0",
      [req.user.id]
    );
    return ok(res, { count: row.count }, "Total de não lidas");
  } catch (err) { next(err); }
}

async function send(req, res, next) {
  try {
    const { titulo, mensagem } = req.body;
    if (!titulo || !mensagem) {
      return res.status(400).json({ success: false, message: "titulo e mensagem são obrigatórios" });
    }
    const result = await db.run(
      "INSERT INTO notificacoes (user_id, titulo, mensagem) VALUES (?, ?, ?)",
      [req.user.id, titulo, mensagem]
    );
    return created(res, { id: result.id, user_id: req.user.id, titulo, mensagem }, "Notificação enviada");
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const result = await db.run(
      "UPDATE notificacoes SET lida = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Notificação não encontrada" });
    return noData(res, "Notificação marcada como lida");
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await db.run("UPDATE notificacoes SET lida = 1 WHERE user_id = ?", [req.user.id]);
    return noData(res, "Todas as notificações marcadas como lidas");
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await db.run(
      "DELETE FROM notificacoes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Notificação não encontrada" });
    return noData(res, "Notificação removida");
  } catch (err) { next(err); }
}

module.exports = { getAll, getUnreadCount, send, markRead, markAllRead, remove };
