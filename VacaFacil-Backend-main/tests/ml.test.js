const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers");

describe("GET /ml/predict-production", () => {
  it("retorna previsão de produção", async () => {
    const token = await registerAndLogin("ml_pred@email.com");
    const res = await request(app).get("/ml/predict-production").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("previsao_proximos_7_dias");
    expect(res.body.data).toHaveProperty("media_diaria");
    expect(res.body.data).toHaveProperty("base_registros");
  });

  it("retorna média zero sem registros de produção", async () => {
    const token = await registerAndLogin("ml_pred2@email.com");
    const res = await request(app).get("/ml/predict-production").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.media_diaria).toBe(0);
    expect(res.body.data.previsao_proximos_7_dias).toBe(0);
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/ml/predict-production");
    expect(res.status).toBe(401);
  });
});

describe("GET /ml/analyze-performance", () => {
  it("retorna análise de desempenho", async () => {
    const token = await registerAndLogin("ml_perf@email.com");
    const res = await request(app).get("/ml/analyze-performance").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("total_vacas");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/ml/analyze-performance");
    expect(res.status).toBe(401);
  });
});

describe("GET /ml/detect-anomalies", () => {
  it("retorna lista de anomalias", async () => {
    const token = await registerAndLogin("ml_anom@email.com");
    const res = await request(app).get("/ml/detect-anomalies").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("anomalias");
    expect(Array.isArray(res.body.data.anomalias)).toBe(true);
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/ml/detect-anomalies");
    expect(res.status).toBe(401);
  });
});

describe("GET /ml/recommendations", () => {
  it("retorna recomendações", async () => {
    const token = await registerAndLogin("ml_rec@email.com");
    const res = await request(app).get("/ml/recommendations").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("recomendacoes");
    expect(Array.isArray(res.body.data.recomendacoes)).toBe(true);
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/ml/recommendations");
    expect(res.status).toBe(401);
  });
});

describe("GET /ml/financial-forecast", () => {
  it("retorna previsão financeira", async () => {
    const token = await registerAndLogin("ml_fin@email.com");
    const res = await request(app).get("/ml/financial-forecast").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("previsao_receita_proximo_mes");
    expect(res.body.data).toHaveProperty("previsao_despesa_proximo_mes");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/ml/financial-forecast");
    expect(res.status).toBe(401);
  });
});

describe("GET /ml/insights", () => {
  it("retorna insights", async () => {
    const token = await registerAndLogin("ml_ins@email.com");
    const res = await request(app).get("/ml/insights").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("insights");
    expect(Array.isArray(res.body.data.insights)).toBe(true);
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/ml/insights");
    expect(res.status).toBe(401);
  });
});
