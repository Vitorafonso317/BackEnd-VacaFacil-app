const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:8081"];

app.set("trust proxy", 1);
app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (ex: apps mobile nativos, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origem não permitida — ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Serve as fotos das vacas como arquivos estáticos
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}${req.method}\x1b[0m ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.json({ success: true, message: "API VacaFácil funcionando", docs: "/docs" }));

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/vacas", require("./routes/cattleRoutes"));
app.use("/producao", require("./routes/productionRoutes"));
app.use("/financeiro", require("./routes/financeiroRoutes"));
app.use("/reproducao", require("./routes/reproducaoRoutes"));
app.use("/marketplace", require("./routes/marketplaceRoutes"));
app.use("/notifications", require("./routes/notificacoesRoutes"));
app.use("/subscriptions", require("./routes/assinaturasRoutes"));
app.use("/relatorios", require("./routes/relatoriosRoutes"));
app.use("/ml", require("./routes/mlRoutes"));
app.use("/medicamentos", require("./routes/medicamentosRoutes"));

app.use(errorMiddleware);

module.exports = app;
