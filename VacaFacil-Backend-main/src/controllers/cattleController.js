const cattleService = require("../services/cattleService");
const { ok, created, noData, paginated } = require("../middleware/response");
const path = require("path");
const fs = require("fs");

async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const { rows, total } = await cattleService.getAll(req.user.id, page, limit);
    return paginated(res, rows, total, page, limit, "Lista de vacas");
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const vaca = await cattleService.getOne(req.params.id, req.user.id);
    return ok(res, vaca, "Vaca encontrada");
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const vaca = await cattleService.create(req.body, req.user.id);
    return created(res, vaca, "Vaca criada com sucesso");
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    await cattleService.update(req.params.id, req.body, req.user.id);
    return noData(res, "Vaca atualizada com sucesso");
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await cattleService.remove(req.params.id, req.user.id);
    return noData(res, "Vaca removida com sucesso");
  } catch (err) { next(err); }
}

async function uploadFoto(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error("Nenhuma imagem enviada");
      err.status = 400;
      throw err;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fotoUrl = `${baseUrl}/uploads/vacas/${req.file.filename}`;

    // Remove foto antiga se existir
    const vaca = await cattleService.getOne(req.params.id, req.user.id);
    if (vaca.foto_url) {
      const oldFile = path.resolve(__dirname, "../uploads/vacas", path.basename(vaca.foto_url));
      fs.unlink(oldFile, () => {}); // ignora erro se arquivo não existir
    }

    await cattleService.updateFoto(req.params.id, fotoUrl, req.user.id);
    return ok(res, { foto_url: fotoUrl }, "Foto atualizada com sucesso");
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove, uploadFoto };
