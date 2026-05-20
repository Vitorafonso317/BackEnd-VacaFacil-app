const productionService = require("../services/productionService");
const { ok, created, noData, paginated } = require("../middleware/response");

async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const vacaId = req.query.vaca_id ? parseInt(req.query.vaca_id) : null;
    const { rows, total } = await productionService.getAll(req.user.id, page, limit, vacaId);
    return paginated(res, rows, total, page, limit, "Lista de produções");
  } catch (err) { next(err); }
}

async function getDailyVariation(req, res, next) {
  try {
    const data = await productionService.getDailyVariation(req.user.id);
    return ok(res, data, "Variação diária de produção");
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const result = await productionService.create(req.body, req.user.id);
    return created(res, result, "Produção registrada com sucesso");
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    await productionService.update(req.params.id, req.body, req.user.id);
    return noData(res, "Produção atualizada com sucesso");
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await productionService.remove(req.params.id, req.user.id);
    return noData(res, "Produção removida com sucesso");
  } catch (err) { next(err); }
}

module.exports = { getAll, getDailyVariation, create, update, remove };
