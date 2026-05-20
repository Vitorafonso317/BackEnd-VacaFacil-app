const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers");

async function getPrimeiroPlano() {
  const res = await request(app).get("/subscriptions/plans");
  return res.body.data[0];
}

describe("GET /subscriptions/plans", () => {
  it("lista planos sem autenticação", async () => {
    const res = await request(app).get("/subscriptions/plans");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /subscriptions/status", () => {
  it("retorna sem assinatura para usuário novo", async () => {
    const token = await registerAndLogin("as_status@email.com");
    const res = await request(app).get("/subscriptions/status").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ status: "sem assinatura" });
  });

  it("rejeita sem token", async () => {
    const res = await request(app).get("/subscriptions/status");
    expect(res.status).toBe(401);
  });
});

describe("POST /subscriptions/subscribe", () => {
  it("assina plano com sucesso", async () => {
    const token = await registerAndLogin("as_sub@email.com");
    const plano = await getPrimeiroPlano();
    if (!plano) return;
    const res = await request(app)
      .post("/subscriptions/subscribe")
      .set("Authorization", `Bearer ${token}`)
      .send({ plano_id: plano.id });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("rejeita sem plano_id", async () => {
    const token = await registerAndLogin("as_sub2@email.com");
    const res = await request(app)
      .post("/subscriptions/subscribe")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("rejeita plano inexistente", async () => {
    const token = await registerAndLogin("as_sub3@email.com");
    const res = await request(app)
      .post("/subscriptions/subscribe")
      .set("Authorization", `Bearer ${token}`)
      .send({ plano_id: 999999 });
    expect(res.status).toBe(404);
  });

  it("rejeita sem token", async () => {
    const res = await request(app).post("/subscriptions/subscribe").send({ plano_id: 1 });
    expect(res.status).toBe(401);
  });
});

describe("DELETE /subscriptions/cancel", () => {
  it("cancela assinatura ativa", async () => {
    const token = await registerAndLogin("as_cancel@email.com");
    const plano = await getPrimeiroPlano();
    if (!plano) return;
    await request(app).post("/subscriptions/subscribe").set("Authorization", `Bearer ${token}`).send({ plano_id: plano.id });
    const res = await request(app).delete("/subscriptions/cancel").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("retorna 404 sem assinatura ativa", async () => {
    const token = await registerAndLogin("as_cancel2@email.com");
    const res = await request(app).delete("/subscriptions/cancel").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("rejeita sem token", async () => {
    const res = await request(app).delete("/subscriptions/cancel");
    expect(res.status).toBe(401);
  });
});
