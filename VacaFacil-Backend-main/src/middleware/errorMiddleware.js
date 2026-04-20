function errorMiddleware(err, req, res, next) {
  console.error("❌ Error:", err.message);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || "Erro interno do servidor" });
}

module.exports = errorMiddleware;
