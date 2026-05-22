const { createClient } = require("@libsql/client");

class Database {
  constructor() {
    this.client = null;
  }

  async connect() {
    const url = process.env.TURSO_URL || "file:database.sqlite";
    const authToken = process.env.TURSO_AUTH_TOKEN;

    this.client = createClient({ url, ...(authToken ? { authToken } : {}) });

    const target = url.startsWith("libsql://") ? `Turso (${url})` : `SQLite local (${url})`;
    console.log(`💾 Database connected: ${target}`);

    await this.initTables();
  }

  async initTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        foto_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )`,
      `CREATE TABLE IF NOT EXISTS vacas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        raca TEXT,
        idade INTEGER,
        peso REAL,
        status_saude TEXT DEFAULT 'saudavel',
        foto_url TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS producao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vaca_id INTEGER NOT NULL,
        data DATE NOT NULL,
        litros REAL NOT NULL,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vaca_id) REFERENCES vacas(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS financeiro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL CHECK(tipo IN ('receita','despesa')),
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        data DATE NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS reproducao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vaca_id INTEGER NOT NULL,
        tipo_evento TEXT NOT NULL,
        data DATE NOT NULL,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vaca_id) REFERENCES vacas(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS marketplace (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descricao TEXT,
        preco REAL NOT NULL,
        categoria TEXT,
        contato TEXT,
        vaca_id INTEGER,
        fotos TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vaca_id) REFERENCES vacas(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS medicamentos_tratamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vaca_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        nome_medicamento TEXT NOT NULL,
        data_aplicacao DATE NOT NULL,
        dias_carencia INTEGER NOT NULL,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vaca_id) REFERENCES vacas(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS notificacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        lida INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS planos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        descricao TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS assinaturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        plano_id INTEGER NOT NULL,
        status TEXT DEFAULT 'ativo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plano_id) REFERENCES planos(id)
      )`,
    ];

    for (const sql of tables) {
      await this.run(sql);
    }

    await this.run(`INSERT OR IGNORE INTO planos (id, nome, preco, descricao) VALUES
      (1, 'Gratuito', 0, 'Plano basico'),
      (2, 'Ouro', 29.90, 'Plano profissional'),
      (3, 'Diamante', 59.90, 'Plano premium')`);

    // Migrations: adiciona colunas novas em tabelas existentes (ignora se já existir)
    const migrations = [
      "ALTER TABLE marketplace ADD COLUMN vaca_id INTEGER REFERENCES vacas(id) ON DELETE SET NULL",
      "ALTER TABLE marketplace ADD COLUMN fotos TEXT",
    ];
    for (const sql of migrations) {
      try { await this.run(sql); } catch { /* coluna já existe */ }
    }

    // Indexes para queries frequentes por user_id / vaca_id
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_vacas_user_id ON vacas(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_producao_vaca_id ON producao(vaca_id)",
      "CREATE INDEX IF NOT EXISTS idx_financeiro_user_id ON financeiro(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_marketplace_user_id ON marketplace(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_assinaturas_user_id ON assinaturas(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_medicamentos_user_id ON medicamentos_tratamentos(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_medicamentos_vaca_id ON medicamentos_tratamentos(vaca_id)",
    ];
    for (const sql of indexes) {
      await this.run(sql);
    }

    console.log("✅ Tables created/verified");
  }

  async query(sql, params = []) {
    const result = await this.client.execute({ sql, args: params });
    return result.rows.map(row => ({ ...row }));
  }

  async get(sql, params = []) {
    const result = await this.client.execute({ sql, args: params });
    return result.rows[0] ? { ...result.rows[0] } : null;
  }

  async run(sql, params = []) {
    const result = await this.client.execute({ sql, args: params });
    return {
      id: Number(result.lastInsertRowid),
      changes: result.rowsAffected,
    };
  }

  async close() {
    console.log("💾 Database connection closed");
  }
}

module.exports = new Database();
