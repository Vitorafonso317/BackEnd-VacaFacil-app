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
    // Busca as últimas 8 produções de cada vaca (1 mais recente + 7 para a média)
    const rows = await db.query(
      `SELECT p.vaca_id, v.nome AS vaca_nome, p.litros, p.data
       FROM producao p
       JOIN vacas v ON p.vaca_id = v.id
       WHERE v.user_id = ?
       ORDER BY p.vaca_id, p.data DESC`,
      [req.user.id]
    );

    // Agrupa registros por vaca
    const porVaca = {};
    for (const row of rows) {
      if (!porVaca[row.vaca_id]) porVaca[row.vaca_id] = { nome: row.vaca_nome, registros: [] };
      porVaca[row.vaca_id].registros.push(row.litros);
    }

    const anomalias = [];

    for (const [vacaId, { nome, registros }] of Object.entries(porVaca)) {
      // Precisa de ao menos 3 registros para ser estatisticamente válido
      if (registros.length < 3) continue;

      const ultimoRegistro = registros[0];
      const janela = registros.slice(1, 8); // até 7 registros anteriores
      const media = janela.reduce((s, v) => s + v, 0) / janela.length;

      if (media === 0) continue;

      const quedaPct = ((media - ultimoRegistro) / media) * 100;

      if (quedaPct >= 20) {
        const severidade = quedaPct >= 30 ? "alta" : "media";
        const sugestao = severidade === "alta"
          ? "Verifique imediatamente o úbere. Sintomas de mastite ou febre."
          : "Monitore a alimentação e hidratação. Possível estresse ou mudança de dieta.";

        anomalias.push({
          vaca_id: parseInt(vacaId),
          vaca_nome: nome,
          ultimo_registro: +ultimoRegistro.toFixed(1),
          media_7_dias: +media.toFixed(1),
          queda_pct: +quedaPct.toFixed(1),
          mensagem: `Queda de ${quedaPct.toFixed(0)}% abaixo da média semanal (${media.toFixed(1)}L → ${ultimoRegistro.toFixed(1)}L).`,
          severidade,
          sugestao,
        });
      }
    }

    anomalias.sort((a, b) => b.queda_pct - a.queda_pct);

    return ok(res, { anomalias, total: anomalias.length }, "Detecção de anomalias");
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
