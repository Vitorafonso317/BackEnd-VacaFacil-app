const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers");

async function criarAnuncio(token, extra = {}) {
  const res = await request(app)
    .post("/marketplace")
    .set("Authorization", `Bearer ${token}`)
    .send({ titulo: "Vaca à venda", preco: 3000, ...extra });
  return res.body.data;
}

describe("GET /marketplace", () => {
  it("lista anúncios sem autenticação (público)", async () => {
    const res = await request(app).get("/marketplace");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("respeita paginação", async () => {
    const res = await request(app).get("/marketplace?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 5 });
  });
});

describe("GET /marketplace/:id", () => {
  it("retorna anúncio sem autenticação (público)", async () => {
    const token = await registerAndLogin("mg@email.com");
    const anuncio = await criarAnuncio(token);
    const res = await request(app).get(`/marketplace/${anuncio.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(anuncio.id);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).get("/marketplace/999999");
    expect(res.status).toBe(404);
  });
});

describe("POST /marketplace", () => {
  it("cria anúncio com sucesso", async () => {
    const token = await registerAndLogin("mc@email.com");
    const res = await request(app)
      .post("/marketplace")
      .set("Authorization", `Bearer ${token}`)
      .send({ titulo: "Bezerro à venda", preco: 1500, categoria: "bovino" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.titulo).toBe("Bezerro à venda");
  });

  it("rejeita sem token", async () => {
    const res = await request(app).post("/marketplace").send({ titulo: "Anuncio", preco: 100 });
    expect(res.status).toBe(401);
  });
});

describe("PUT /marketplace/:id", () => {
  it("atualiza anúncio do próprio usuário", async () => {
    const token = await registerAndLogin("mu@email.com");
    const anuncio = await criarAnuncio(token);
    const res = await request(app)
      .put(`/marketplace/${anuncio.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ titulo: "Vaca à venda atualizada", preco: 3500 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede atualizar anúncio de outro usuário", async () => {
    const token1 = await registerAndLogin("mu1@email.com");
    const token2 = await registerAndLogin("mu2@email.com");
    const anuncio = await criarAnuncio(token1);
    const res = await request(app)
      .put(`/marketplace/${anuncio.id}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ titulo: "hack", preco: 1 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /marketplace/:id", () => {
  it("remove anúncio do próprio usuário", async () => {
    const token = await registerAndLogin("md@email.com");
    const anuncio = await criarAnuncio(token);
    const res = await request(app).delete(`/marketplace/${anuncio.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede remover anúncio de outro usuário", async () => {
    const token1 = await registerAndLogin("md1@email.com");
    const token2 = await registerAndLogin("md2@email.com");
    const anuncio = await criarAnuncio(token1);
    const res = await request(app).delete(`/marketplace/${anuncio.id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });

  it("rejeita sem token", async () => {
    const token = await registerAndLogin("md3@email.com");
    const anuncio = await criarAnuncio(token);
    const res = await request(app).delete(`/marketplace/${anuncio.id}`);
    expect(res.status).toBe(401);
  });
});
