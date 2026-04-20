const request = require("supertest");
const app = require("../src/app");

async function registerAndLogin(email = "prod@email.com") {
  await request(app).post("/auth/register").send({ nome: "User", email, password: "senha123" });
  const res = await request(app).post("/auth/login").send({ email, password: "senha123" });
  return res.body.data.token;
}

async function criarVaca(token) {
  const res = await request(app).post("/vacas").set("Authorization", `Bearer ${token}`).send({ nome: "Mimosa" });
  return res.body.data;
}

async function criarProducao(token, vaca_id, dados = {}) {
  const res = await request(app)
    .post("/producao")
    .set("Authorization", `Bearer ${token}`)
    .send({ vaca_id, data: "2025-01-15", litros: 25.5, ...dados });
  return res.body.data;
}

describe("POST /producao", () => {
  it("cria produção com sucesso", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const res = await request(app)
      .post("/producao")
      .set("Authorization", `Bearer ${token}`)
      .send({ vaca_id: vaca.id, data: "2025-01-15", litros: 25.5 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.litros).toBe(25.5);
  });

  it("rejeita vaca_id de outro usuário", async () => {
    const token1 = await registerAndLogin("p1@email.com");
    const token2 = await registerAndLogin("p2@email.com");
    const vaca = await criarVaca(token1);

    const res = await request(app)
      .post("/producao")
      .set("Authorization", `Bearer ${token2}`)
      .send({ vaca_id: vaca.id, data: "2025-01-15", litros: 10 });
    expect(res.status).toBe(404);
  });

  it("rejeita litros zero ou negativo", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const res = await request(app)
      .post("/producao")
      .set("Authorization", `Bearer ${token}`)
      .send({ vaca_id: vaca.id, data: "2025-01-15", litros: 0 });
    expect(res.status).toBe(400);
  });

  it("rejeita sem campos obrigatórios", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/producao").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
});

describe("GET /producao", () => {
  it("lista produções paginadas do usuário", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    await criarProducao(token, vaca.id);
    await criarProducao(token, vaca.id, { litros: 30 });

    const res = await request(app).get("/producao?page=1&limit=10").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it("não retorna produções de outro usuário", async () => {
    const token1 = await registerAndLogin("q1@email.com");
    const token2 = await registerAndLogin("q2@email.com");
    const vaca = await criarVaca(token1);
    await criarProducao(token1, vaca.id);

    const res = await request(app).get("/producao").set("Authorization", `Bearer ${token2}`);
    expect(res.body.data.length).toBe(0);
  });
});

describe("PUT /producao/:id", () => {
  it("atualiza produção com sucesso", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const prod = await criarProducao(token, vaca.id);

    const res = await request(app)
      .put(`/producao/${prod.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ litros: 35 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede atualizar produção de outro usuário", async () => {
    const token1 = await registerAndLogin("r1@email.com");
    const token2 = await registerAndLogin("r2@email.com");
    const vaca = await criarVaca(token1);
    const prod = await criarProducao(token1, vaca.id);

    const res = await request(app).put(`/producao/${prod.id}`).set("Authorization", `Bearer ${token2}`).send({ litros: 99 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /producao/:id", () => {
  it("remove produção com sucesso", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const prod = await criarProducao(token, vaca.id);

    const res = await request(app).delete(`/producao/${prod.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede remover produção de outro usuário", async () => {
    const token1 = await registerAndLogin("s1@email.com");
    const token2 = await registerAndLogin("s2@email.com");
    const vaca = await criarVaca(token1);
    const prod = await criarProducao(token1, vaca.id);

    const res = await request(app).delete(`/producao/${prod.id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});
