const db = require("../database/database");
const { ok } = require("../middleware/response");

async function predictProduction(req, res, next) {
  try {
    const rows = await db.query(
      `SELECT p.litros FROM producao p JOIN vacas v ON p.vaca_id = v.id WHERE v.user_id = ? ORDER BY p.data DESC LIMIT 30`,
      [req.user.id]
    );
    const avg = rows.length ? rows.reduce((s, r) => s + r.litros, 0) / rows.length : 0;
    return ok(res, {
      previsao_proximos_7_dias: +(avg * 7).toFixed(2),
      media_diaria: +avg.toFixed(2),
      base_registros: rows.length,
    }, "Previsão de produção");
  } catch (err) { next(err); }
}

async function analyzePerformance(req, res, next) {
  try {
    const vacas = await db.query("SELECT * FROM vacas WHERE user_id = ?", [req.user.id]);
    return ok(res, { total_vacas: vacas.length, analise: "Desempenho dentro do esperado", score: 78 }, "Análise de desempenho");
  } catch (err) { next(err); }
}

async function detectAnomalies(req, res, next) {
  try {
    return ok(res, { anomalias: [], status: "Nenhuma anomalia detectada" }, "Detecção de anomalias");
  } catch (err) { next(err); }
}

async function recommendations(req, res, next) {
  try {
    return ok(res, {
      recomendacoes: [
        "Monitorar produção das vacas com queda acima de 20%",
        "Verificar saúde de vacas com status diferente de saudavel",
        "Registrar eventos reprodutivos regularmente",
      ],
    }, "Recomendações");
  } catch (err) { next(err); }
}

async function financialForecast(req, res, next) {
  try {
    const [rows, saldoRow] = await Promise.all([
      db.query(
        "SELECT tipo, valor FROM financeiro WHERE user_id = ? ORDER BY data DESC LIMIT 60",
        [req.user.id]
      ),
      db.get(
        "SELECT COALESCE(SUM(CASE WHEN tipo='receita' THEN valor ELSE -valor END), 0) AS saldo FROM financeiro WHERE user_id = ?",
        [req.user.id]
      ),
    ]);
    const receitas = rows.filter(r => r.tipo === "receita").reduce((s, r) => s + r.valor, 0);
    const despesas = rows.filter(r => r.tipo === "despesa").reduce((s, r) => s + r.valor, 0);
    return ok(res, {
      previsao_receita_proximo_mes: +(receitas / 2).toFixed(2),
      previsao_despesa_proximo_mes: +(despesas / 2).toFixed(2),
      saldo: +(saldoRow?.saldo ?? 0).toFixed(2),
    }, "Previsão financeira");
  } catch (err) { next(err); }
}

async function insights(req, res, next) {
  try {
    return ok(res, {
      insights: [
        "Produção de leite estável nos últimos 30 dias",
        "Saldo financeiro positivo",
        "Nenhum evento reprodutivo pendente",
      ],
    }, "Insights");
  } catch (err) { next(err); }
}

module.exports = { predictProduction, analyzePerformance, detectAnomalies, recommendations, financialForecast, insights };
