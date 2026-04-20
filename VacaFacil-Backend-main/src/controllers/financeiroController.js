const financialService = require("../services/financialService");
const { ok, created, noData, paginated } = require("../middleware/response");

async function getReceitas(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { rows, total } = await financialService.getByTipo("receita", req.user.id, page, limit);
    return paginated(res, rows, total, page, limit, "Lista de receitas");
  } catch (err) { next(err); }
}

async function createReceita(req, res, next) {
  try {
    const result = await financialService.create("receita", req.body, req.user.id);
    return created(res, result, "Receita criada com sucesso");
  } catch (err) { next(err); }
}

async function updateReceita(req, res, next) {
  try {
    await financialService.update(req.params.id, "receita", req.body, req.user.id);
    return noData(res, "Receita atualizada com sucesso");
  } catch (err) { next(err); }
}

async function deleteReceita(req, res, next) {
  try {
    await financialService.remove(req.params.id, "receita", req.user.id);
    return noData(res, "Receita removida com sucesso");
  } catch (err) { next(err); }
}

async function getDespesas(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { rows, total } = await financialService.getByTipo("despesa", req.user.id, page, limit);
    return paginated(res, rows, total, page, limit, "Lista de despesas");
  } catch (err) { next(err); }
}

async function createDespesa(req, res, next) {
  try {
    const result = await financialService.create("despesa", req.body, req.user.id);
    return created(res, result, "Despesa criada com sucesso");
  } catch (err) { next(err); }
}

async function updateDespesa(req, res, next) {
  try {
    await financialService.update(req.params.id, "despesa", req.body, req.user.id);
    return noData(res, "Despesa atualizada com sucesso");
  } catch (err) { next(err); }
}

async function deleteDespesa(req, res, next) {
  try {
    await financialService.remove(req.params.id, "despesa", req.user.id);
    return noData(res, "Despesa removida com sucesso");
  } catch (err) { next(err); }
}

module.exports = { getReceitas, createReceita, updateReceita, deleteReceita, getDespesas, createDespesa, updateDespesa, deleteDespesa };
