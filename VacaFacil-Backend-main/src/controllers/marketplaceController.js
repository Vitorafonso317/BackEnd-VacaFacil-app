const db = require("../database/database");
const { ok, created, noData, paginated } = require("../middleware/response");

async function getAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const [rows, countRow] = await Promise.all([
      db.query("SELECT * FROM marketplace ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]),
      db.get("SELECT COUNT(*) as total FROM marketplace"),
    ]);
    return paginated(res, rows, countRow.total, page, limit, "Lista do marketplace");
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const row = await db.get("SELECT * FROM marketplace WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: "Anúncio não encontrado" });
    return ok(res, row, "Anúncio encontrado");
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { titulo, descricao, preco, categoria } = req.body;
    const result = await db.run(
      "INSERT INTO marketplace (titulo, descricao, preco, categoria, user_id) VALUES (?, ?, ?, ?, ?)",
      [titulo, descricao || null, preco, categoria || null, req.user.id]
    );
    return created(res, { id: result.id, titulo, descricao, preco, categoria }, "Anúncio criado com sucesso");
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { titulo, descricao, preco, categoria } = req.body;
    const fields = [];
    const values = [];

    if (titulo) { fields.push("titulo = ?"); values.push(titulo); }
    if (descricao !== undefined) { fields.push("descricao = ?"); values.push(descricao); }
    if (preco !== undefined) { fields.push("preco = ?"); values.push(preco); }
    if (categoria !== undefined) { fields.push("categoria = ?"); values.push(categoria); }

    if (!fields.length) return res.status(400).json({ success: false, message: "Nenhum campo para atualizar" });

    values.push(req.params.id, req.user.id);
    const result = await db.run(
      `UPDATE marketplace SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Anúncio não encontrado" });
    return noData(res, "Anúncio atualizado com sucesso");
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await db.run(
      "DELETE FROM marketplace WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.changes) return res.status(404).json({ success: false, message: "Anúncio não encontrado" });
    return noData(res, "Anúncio removido com sucesso");
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove };
