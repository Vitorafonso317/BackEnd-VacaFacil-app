const request = require("supertest");
const app = require("../src/app");

const VALID_USER = { nome: "João", email: "joao@email.com", password: "senha123" };

describe("POST /auth/register", () => {
  it("registra usuário com sucesso", async () => {
    const res = await request(app).post("/auth/register").send(VALID_USER);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ nome: "João", email: "joao@email.com" });
    expect(res.body.data.password).toBeUndefined();
  });

  it("bloqueia email duplicado", async () => {
    await request(app).post("/auth/register").send(VALID_USER);
    const res = await request(app).post("/auth/register").send(VALID_USER);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejeita email inválido", async () => {
    const res = await request(app).post("/auth/register").send({ ...VALID_USER, email: "nao-e-email" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejeita senha curta", async () => {
    const res = await request(app).post("/auth/register").send({ ...VALID_USER, email: "outro@email.com", password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejeita nome vazio", async () => {
    const res = await request(app).post("/auth/register").send({ ...VALID_USER, nome: "" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/auth/register").send(VALID_USER);
  });

  it("login com sucesso retorna token", async () => {
    const res = await request(app).post("/auth/login").send({ email: VALID_USER.email, password: VALID_USER.password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({ email: VALID_USER.email });
  });

  it("rejeita senha errada", async () => {
    const res = await request(app).post("/auth/login").send({ email: VALID_USER.email, password: "errada" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejeita email inexistente", async () => {
    const res = await request(app).post("/auth/login").send({ email: "nao@existe.com", password: "senha123" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejeita requisição sem campos", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
