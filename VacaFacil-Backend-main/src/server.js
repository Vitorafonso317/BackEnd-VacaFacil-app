require("dotenv").config();
const app = require("./app");
const db = require("./database/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.connect();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Porta ${PORT} já está em uso. Encerre o processo e tente novamente.`);
      } else {
        console.error("❌ Erro no servidor:", err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();