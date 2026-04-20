const db = require("../database/database");
const { ok } = require("../middleware/response");

async function producao(req, res, next) {
  try {
    const rows = await db.query(
      `SELECT p.*, v.nome as vaca_nome FROM producao p
       JOIN vacas v ON p.vaca_id = v.id
       WHERE v.user_id = ? ORDER BY p.data DESC`,
      [req.user.id]
    );
    const total = rows.reduce((sum, r) => sum + r.litros, 0);
    return ok(res, { total_litros: total, registros: rows }, "Relatório de produção");
  } catch (err) { next(err); }
}

async function financeiro(req, res, next) {
  try {
    const rows = await db.query(
      "SELECT * FROM financeiro WHERE user_id = ? ORDER BY data DESC",
      [req.user.id]
    );
    const receitas = rows.filter(r => r.tipo === "receita").reduce((s, r) => s + r.valor, 0);
    const despesas = rows.filter(r => r.tipo === "despesa").reduce((s, r) => s + r.valor, 0);
    return ok(res, { receitas_total: receitas, despesas_total: despesas, saldo: receitas - despesas, registros: rows }, "Relatório financeiro");
  } catch (err) { next(err); }
}

async function completo(req, res, next) {
  try {
    const [vacas, prod, fin, repro] = await Promise.all([
      db.query("SELECT * FROM vacas WHERE user_id = ?", [req.user.id]),
      db.query(`SELECT p.* FROM producao p JOIN vacas v ON p.vaca_id = v.id WHERE v.user_id = ?`, [req.user.id]),
      db.query("SELECT * FROM financeiro WHERE user_id = ?", [req.user.id]),
      db.query(`SELECT r.* FROM reproducao r JOIN vacas v ON r.vaca_id = v.id WHERE v.user_id = ?`, [req.user.id]),
    ]);

    return ok(res, {
      vacas: { total: vacas.length, dados: vacas },
      producao: { total_litros: prod.reduce((s, r) => s + r.litros, 0), registros: prod },
      financeiro: {
        receitas: fin.filter(r => r.tipo === "receita").reduce((s, r) => s + r.valor, 0),
        despesas: fin.filter(r => r.tipo === "despesa").reduce((s, r) => s + r.valor, 0),
        registros: fin,
      },
      reproducao: { total: repro.length, registros: repro },
    }, "Relatório completo");
  } catch (err) { next(err); }
}

module.exports = { producao, financeiro, completo };
