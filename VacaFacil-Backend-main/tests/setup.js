require("dotenv").config();
process.env.JWT_SECRET = "test_secret_key";
process.env.NODE_ENV = "test";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

const sqlite3 = require("sqlite3").verbose();
const db = require("../src/database/database");

beforeAll(async () => {
  await new Promise((resolve, reject) => {
    const mem = new sqlite3.Database(":memory:", (err) => {
      if (err) return reject(err);
      resolve(mem);
    });
    db.db = mem;
  });
  await db.initTables();
});

afterEach(async () => {
  await db.run("DELETE FROM notificacoes");
  await db.run("DELETE FROM reproducao");
  await db.run("DELETE FROM producao");
  await db.run("DELETE FROM financeiro");
  await db.run("DELETE FROM marketplace");
  await db.run("DELETE FROM assinaturas");
  await db.run("DELETE FROM vacas");
  await db.run("DELETE FROM users");
  await db.run("DELETE FROM planos");
  await db.run(`INSERT OR IGNORE INTO planos (id, nome, preco, descricao) VALUES
    (1, 'Gratuito', 0, 'Plano basico'),
    (2, 'Pro', 29.90, 'Plano profissional'),
    (3, 'Premium', 59.90, 'Plano premium')`);
});

afterAll(async () => {
  await db.close();
});
