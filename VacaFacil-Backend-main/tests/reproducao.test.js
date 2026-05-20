const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin, criarVaca } = require("./helpers");

async function criarEvento(token, vaca_id, extra = {}) {
  const res = await request(app)
    .post("/reproducao")
    .set("Authorization", `Bearer ${token}`)
    .send({ vaca_id, tipo_evento: "inseminacao", data: "2024-01-15", ...extra });
  return res.body.data;
}

describe("POST /reproducao", () => {
  it("registra evento com sucesso", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const res = await request(app)
      .post("/reproducao")
      .set("Authorization", `Bearer ${token}`)
      .send({ vaca_id: vaca.id, tipo_evento: "inseminacao", data: "2024-01-15" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tipo_evento).toBe("inseminacao");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).post("/reproducao").send({ vaca_id: 1, tipo_evento: "inseminacao", data: "2024-01-15" });
    expect(res.status).toBe(401);
  });

  it("rejeita vaca de outro usuário", async () => {
    const token1 = await registerAndLogin("r1@email.com");
    const token2 = await registerAndLogin("r2@email.com");
    const vaca = await criarVaca(token1);
    const res = await request(app)
      .post("/reproducao")
      .set("Authorization", `Bearer ${token2}`)
      .send({ vaca_id: vaca.id, tipo_evento: "inseminacao", data: "2024-01-15" });
    expect(res.status).toBe(404);
  });
});

describe("GET /reproducao", () => {
  it("lista eventos do usuário", async () => {
    const token = await registerAndLogin("rg@email.com");
    const vaca = await criarVaca(token);
    await criarEvento(token, vaca.id);
    const res = await request(app).get("/reproducao").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("não retorna eventos de outro usuário", async () => {
    const token1 = await registerAndLogin("rg1@email.com");
    const token2 = await registerAndLogin("rg2@email.com");
    const vaca = await criarVaca(token1);
    await criarEvento(token1, vaca.id);
    const res = await request(app).get("/reproducao").set("Authorization", `Bearer ${token2}`);
    expect(res.body.data.length).toBe(0);
  });
});

describe("PUT /reproducao/:id", () => {
  it("atualiza evento com sucesso", async () => {
    const token = await registerAndLogin("ru@email.com");
    const vaca = await criarVaca(token);
    const evento = await criarEvento(token, vaca.id);
    const res = await request(app)
      .put(`/reproducao/${evento.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ observacoes: "observação atualizada" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede atualizar evento de outro usuário", async () => {
    const token1 = await registerAndLogin("ru1@email.com");
    const token2 = await registerAndLogin("ru2@email.com");
    const vaca = await criarVaca(token1);
    const evento = await criarEvento(token1, vaca.id);
    const res = await request(app)
      .put(`/reproducao/${evento.id}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ observacoes: "hack" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /reproducao/:id", () => {
  it("remove evento com sucesso", async () => {
    const token = await registerAndLogin("rd@email.com");
    const vaca = await criarVaca(token);
    const evento = await criarEvento(token, vaca.id);
    const res = await request(app).delete(`/reproducao/${evento.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede remover evento de outro usuário", async () => {
    const token1 = await registerAndLogin("rd1@email.com");
    const token2 = await registerAndLogin("rd2@email.com");
    const vaca = await criarVaca(token1);
    const evento = await criarEvento(token1, vaca.id);
    const res = await request(app).delete(`/reproducao/${evento.id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});
