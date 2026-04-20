const request = require("supertest");
const app = require("../src/app");

const USER = { nome: "Maria", email: "maria@email.com", password: "senha123" };

async function registerAndLogin(data = USER) {
  await request(app).post("/auth/register").send(data);
  const res = await request(app).post("/auth/login").send({ email: data.email, password: data.password });
  return res.body.data.token;
}

describe("GET /users/me", () => {
  it("retorna dados do usuário logado", async () => {
    const token = await registerAndLogin();
    const res = await request(app).get("/users/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ nome: USER.nome, email: USER.email });
    expect(res.body.data.password).toBeUndefined();
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/users/me");
    expect(res.status).toBe(401);
  });

  it("rejeita token inválido", async () => {
    const res = await request(app).get("/users/me").set("Authorization", "Bearer token_invalido");
    expect(res.status).toBe(401);
  });
});

describe("PUT /users/me", () => {
  it("atualiza nome do usuário", async () => {
    const token = await registerAndLogin();
    const res = await request(app).put("/users/me").set("Authorization", `Bearer ${token}`).send({ nome: "Maria Silva" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejeita atualização sem campos", async () => {
    const token = await registerAndLogin();
    const res = await request(app).put("/users/me").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /users/me", () => {
  it("remove a conta do usuário", async () => {
    const token = await registerAndLogin();
    const res = await request(app).delete("/users/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
