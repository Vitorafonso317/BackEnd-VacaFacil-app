const request = require("supertest");
const app = require("../src/app");

async function registerAndLogin(email = "user@email.com") {
  await request(app).post("/auth/register").send({ nome: "User", email, password: "senha123" });
  const res = await request(app).post("/auth/login").send({ email, password: "senha123" });
  return res.body.data.token;
}

async function criarVaca(token, dados = {}) {
  const res = await request(app)
    .post("/vacas")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Mimosa", raca: "Holandesa", idade: 4, peso: 550, ...dados });
  return res.body.data;
}

describe("POST /vacas", () => {
  it("cria vaca com sucesso", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/vacas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Mimosa", raca: "Holandesa", idade: 4, peso: 550 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nome).toBe("Mimosa");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).post("/vacas").send({ nome: "Mimosa" });
    expect(res.status).toBe(401);
  });

  it("rejeita sem nome", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/vacas").set("Authorization", `Bearer ${token}`).send({ raca: "Holandesa" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejeita idade não numérica", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/vacas").set("Authorization", `Bearer ${token}`).send({ nome: "Mimosa", idade: "abc" });
    expect(res.status).toBe(400);
  });
});

describe("GET /vacas", () => {
  it("lista vacas paginadas do usuário", async () => {
    const token = await registerAndLogin();
    await criarVaca(token);
    await criarVaca(token, { nome: "Estrela" });

    const res = await request(app).get("/vacas?page=1&limit=10").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 2 });
  });

  it("não retorna vacas de outro usuário", async () => {
    const token1 = await registerAndLogin("user1@email.com");
    const token2 = await registerAndLogin("user2@email.com");
    await criarVaca(token1);

    const res = await request(app).get("/vacas").set("Authorization", `Bearer ${token2}`);
    expect(res.body.data.length).toBe(0);
  });
});

describe("GET /vacas/:id", () => {
  it("retorna vaca por id", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const res = await request(app).get(`/vacas/${vaca.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(vaca.id);
  });

  it("impede acesso à vaca de outro usuário", async () => {
    const token1 = await registerAndLogin("a1@email.com");
    const token2 = await registerAndLogin("a2@email.com");
    const vaca = await criarVaca(token1);

    const res = await request(app).get(`/vacas/${vaca.id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});

describe("PUT /vacas/:id", () => {
  it("atualiza vaca com sucesso", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const res = await request(app)
      .put(`/vacas/${vaca.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Mimosa Atualizada", peso: 600 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede atualizar vaca de outro usuário", async () => {
    const token1 = await registerAndLogin("b1@email.com");
    const token2 = await registerAndLogin("b2@email.com");
    const vaca = await criarVaca(token1);

    const res = await request(app).put(`/vacas/${vaca.id}`).set("Authorization", `Bearer ${token2}`).send({ nome: "Hack" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /vacas/:id", () => {
  it("remove vaca com sucesso", async () => {
    const token = await registerAndLogin();
    const vaca = await criarVaca(token);
    const res = await request(app).delete(`/vacas/${vaca.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede remover vaca de outro usuário", async () => {
    const token1 = await registerAndLogin("c1@email.com");
    const token2 = await registerAndLogin("c2@email.com");
    const vaca = await criarVaca(token1);

    const res = await request(app).delete(`/vacas/${vaca.id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});
