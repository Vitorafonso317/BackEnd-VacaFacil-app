const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers");

describe("GET /relatorios/producao/json", () => {
  it("retorna relatório de produção", async () => {
    const token = await registerAndLogin("rel_prod@email.com");
    const res = await request(app).get("/relatorios/producao/json").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("total_litros");
    expect(res.body.data).toHaveProperty("registros");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/relatorios/producao/json");
    expect(res.status).toBe(401);
  });

  it("total_litros é zero para usuário sem registros", async () => {
    const token = await registerAndLogin("rel_prod2@email.com");
    const res = await request(app).get("/relatorios/producao/json").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.total_litros).toBe(0);
    expect(res.body.data.registros).toHaveLength(0);
  });
});

describe("GET /relatorios/financeiro/json", () => {
  it("retorna relatório financeiro", async () => {
    const token = await registerAndLogin("rel_fin@email.com");
    const res = await request(app).get("/relatorios/financeiro/json").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("receitas_total");
    expect(res.body.data).toHaveProperty("despesas_total");
    expect(res.body.data).toHaveProperty("saldo");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/relatorios/financeiro/json");
    expect(res.status).toBe(401);
  });

  it("saldo é zero para usuário sem lançamentos", async () => {
    const token = await registerAndLogin("rel_fin2@email.com");
    const res = await request(app).get("/relatorios/financeiro/json").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.saldo).toBe(0);
  });
});

describe("GET /relatorios/completo/json", () => {
  it("retorna relatório completo com todas as seções", async () => {
    const token = await registerAndLogin("rel_comp@email.com");
    const res = await request(app).get("/relatorios/completo/json").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("vacas");
    expect(res.body.data).toHaveProperty("producao");
    expect(res.body.data).toHaveProperty("financeiro");
    expect(res.body.data).toHaveProperty("reproducao");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/relatorios/completo/json");
    expect(res.status).toBe(401);
  });

  it("não mistura dados de usuários diferentes", async () => {
    const token1 = await registerAndLogin("rel_iso1@email.com");
    const token2 = await registerAndLogin("rel_iso2@email.com");
    await request(app).post("/vacas").set("Authorization", `Bearer ${token1}`).send({ nome: "Mimosa", raca: "Holandesa", idade: 4, peso: 500 });
    const res = await request(app).get("/relatorios/completo/json").set("Authorization", `Bearer ${token2}`);
    expect(res.body.data.vacas.total).toBe(0);
  });
});
