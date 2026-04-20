const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

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

app.use(errorMiddleware);

module.exports = app;
