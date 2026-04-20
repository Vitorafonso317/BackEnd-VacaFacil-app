const db = require("../database/database");
const { ok, created, noData } = require("../middleware/response");

async function getPlans(req, res, next) {
  try {
    const plans = await db.query("SELECT * FROM planos", []);
    return ok(res, plans, "Lista de planos");
  } catch (err) { next(err); }
}

async function subscribe(req, res, next) {
  try {
    const { plano_id } = req.body;
    if (!plano_id) return res.status(400).json({ success: false, message: "plano_id é obrigatório" });

    const plano = await db.get("SELECT id FROM planos WHERE id = ?", [plano_id]);
    if (!plano) return res.status(404).json({ success: false, message: "Plano não encontrado" });

    await db.run(
      `INSERT INTO assinaturas (user_id, plano_id, status) VALUES (?, ?, 'ativo')
       ON CONFLICT(user_id) DO UPDATE SET plano_id = excluded.plano_id, status = 'ativo'`,
      [req.user.id, plano_id]
    );
    return created(res, null, "Assinatura realizada com sucesso");
  } catch (err) { next(err); }
}

async function getStatus(req, res, next) {
  try {
    const row = await db.get(
      `SELECT a.*, p.nome as plano_nome, p.preco FROM assinaturas a
       JOIN planos p ON a.plano_id = p.id WHERE a.user_id = ?`,
      [req.user.id]
    );
    return ok(res, row || { status: "sem assinatura" }, "Status da assinatura");
  } catch (err) { next(err); }
}

async function upgrade(req, res, next) {
  try {
    const { plano_id } = req.body;
    if (!plano_id) return res.status(400).json({ success: false, message: "plano_id é obrigatório" });

    const result = await db.run(
      "UPDATE assinaturas SET plano_id = ? WHERE user_id = ?",
      [plano_id, req.user.id]
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Assinatura não encontrada" });
    return noData(res, "Plano atualizado com sucesso");
  } catch (err) { next(err); }
}

async function cancel(req, res, next) {
  try {
    const result = await db.run(
      "UPDATE assinaturas SET status = 'cancelado' WHERE user_id = ?",
      [req.user.id]
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Assinatura não encontrada" });
    return noData(res, "Assinatura cancelada");
  } catch (err) { next(err); }
}

module.exports = { getPlans, subscribe, getStatus, upgrade, cancel };
