const db = require("../database/database");
const { checkCarencia } = require("../controllers/medicamentosController");

async function getAll(userId, page, limit, vacaId = null) {
  const offset = (page - 1) * limit;
  const where = vacaId
    ? "WHERE v.user_id = ? AND p.vaca_id = ?"
    : "WHERE v.user_id = ?";
  const params = vacaId ? [userId, vacaId] : [userId];

  const [rows, countRow] = await Promise.all([
    db.query(
      `SELECT p.* FROM producao p
       JOIN vacas v ON p.vaca_id = v.id
       ${where}
       ORDER BY p.data DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    db.get(
      `SELECT COUNT(*) as total FROM producao p
       JOIN vacas v ON p.vaca_id = v.id ${where}`,
      params
    ),
  ]);
  return { rows, total: countRow.total };
}

async function getDailyVariation(userId) {
  const rows = await db.query(
    `SELECT date(p.data) as dia, ROUND(SUM(p.litros), 2) as total
     FROM producao p
     JOIN vacas v ON p.vaca_id = v.id
     WHERE v.user_id = ? AND p.data >= date('now', '-1 day')
     GROUP BY date(p.data)
     ORDER BY dia DESC
     LIMIT 2`,
    [userId]
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const hoje = rows.find(r => r.dia === todayStr)?.total || 0;
  const ontem = rows.find(r => r.dia === yesterdayStr)?.total || 0;
  const variacao = +(hoje - ontem).toFixed(2);
  const variacao_pct = ontem > 0 ? +((variacao / ontem) * 100).toFixed(1) : null;

  return { hoje_litros: hoje, ontem_litros: ontem, variacao_litros: variacao, variacao_pct };
}

async function create(data, userId) {
  const { vaca_id, data: date, litros, observacoes } = data;
  const vaca = await db.get("SELECT id FROM vacas WHERE id = ? AND user_id = ?", [vaca_id, userId]);
  if (!vaca) {
    const err = new Error("Vaca não encontrada");
    err.status = 404;
    throw err;
  }

  // Verifica carência ativa e inclui aviso na resposta (não bloqueia)
  const carencia = await checkCarencia(vaca_id, userId);

  const result = await db.run(
    "INSERT INTO producao (vaca_id, data, litros, observacoes) VALUES (?, ?, ?, ?)",
    [vaca_id, date, litros, observacoes || null]
  );

  return {
    id: result.id, vaca_id, data: date, litros, observacoes,
    alerta_carencia: carencia
      ? {
          nome_medicamento: carencia.nome_medicamento,
          data_fim_carencia: carencia.data_fim_carencia,
          mensagem: `Esta vaca está em período de carência até ${carencia.data_fim_carencia}. O leite não deve ser enviado ao laticínio!`,
        }
      : null,
  };
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

module.exports = { getAll, getDailyVariation, create, update, remove };
