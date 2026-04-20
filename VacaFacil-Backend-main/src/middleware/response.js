function ok(res, data, message = "Sucesso", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function created(res, data, message = "Criado com sucesso") {
  return ok(res, data, message, 201);
}

function noData(res, message = "Sucesso") {
  return res.json({ success: true, message });
}

function paginated(res, data, total, page, limit, message = "Sucesso") {
  return res.json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

module.exports = { ok, created, noData, paginated, fail };
