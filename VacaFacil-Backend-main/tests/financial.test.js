const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers");

const RECEITA = { descricao: "Venda de leite", valor: 500.0, data: "2025-01-15" };
const DESPESA = { descricao: "Ração", valor: 200.0, data: "2025-01-15" };

describe("POST /financeiro/receitas", () => {
  it("cria receita com sucesso", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token}`).send(RECEITA);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tipo).toBe("receita");
  });

  it("rejeita valor zero", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token}`).send({ ...RECEITA, valor: 0 });
    expect(res.status).toBe(400);
  });

  it("rejeita sem campos obrigatórios", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /financeiro/despesas", () => {
  it("cria despesa com sucesso", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/financeiro/despesas").set("Authorization", `Bearer ${token}`).send(DESPESA);
    expect(res.status).toBe(201);
    expect(res.body.data.tipo).toBe("despesa");
  });
});

describe("GET /financeiro/receitas e /despesas", () => {
  it("lista receitas paginadas", async () => {
    const token = await registerAndLogin();
    await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token}`).send(RECEITA);
    await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token}`).send({ ...RECEITA, descricao: "Outra" });

    const res = await request(app).get("/financeiro/receitas?page=1&limit=10").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it("não retorna registros de outro usuário", async () => {
    const token1 = await registerAndLogin("f1@email.com");
    const token2 = await registerAndLogin("f2@email.com");
    await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token1}`).send(RECEITA);

    const res = await request(app).get("/financeiro/receitas").set("Authorization", `Bearer ${token2}`);
    expect(res.body.data.length).toBe(0);
  });
});

describe("PUT /financeiro/receitas/:id", () => {
  it("atualiza receita com sucesso", async () => {
    const token = await registerAndLogin();
    const criada = await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token}`).send(RECEITA);
    const id = criada.body.data.id;

    const res = await request(app).put(`/financeiro/receitas/${id}`).set("Authorization", `Bearer ${token}`).send({ ...RECEITA, valor: 750 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede atualizar receita de outro usuário", async () => {
    const token1 = await registerAndLogin("g1@email.com");
    const token2 = await registerAndLogin("g2@email.com");
    const criada = await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token1}`).send(RECEITA);
    const id = criada.body.data.id;

    const res = await request(app).put(`/financeiro/receitas/${id}`).set("Authorization", `Bearer ${token2}`).send({ ...RECEITA, valor: 999 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /financeiro/receitas/:id e /despesas/:id", () => {
  it("remove receita com sucesso", async () => {
    const token = await registerAndLogin();
    const criada = await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token}`).send(RECEITA);
    const id = criada.body.data.id;

    const res = await request(app).delete(`/financeiro/receitas/${id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("remove despesa com sucesso", async () => {
    const token = await registerAndLogin();
    const criada = await request(app).post("/financeiro/despesas").set("Authorization", `Bearer ${token}`).send(DESPESA);
    const id = criada.body.data.id;

    const res = await request(app).delete(`/financeiro/despesas/${id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("impede remover receita de outro usuário", async () => {
    const token1 = await registerAndLogin("h1@email.com");
    const token2 = await registerAndLogin("h2@email.com");
    const criada = await request(app).post("/financeiro/receitas").set("Authorization", `Bearer ${token1}`).send(RECEITA);
    const id = criada.body.data.id;

    const res = await request(app).delete(`/financeiro/receitas/${id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});
