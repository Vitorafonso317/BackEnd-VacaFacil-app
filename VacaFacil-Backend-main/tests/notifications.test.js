const request = require("supertest");
const app = require("../src/app");

async function registerAndLogin(email = "notif@email.com") {
  await request(app).post("/auth/register").send({ nome: "User", email, password: "senha123" });
  const res = await request(app).post("/auth/login").send({ email, password: "senha123" });
  return res.body.data.token;
}

async function criarNotificacao(token) {
  const res = await request(app)
    .post("/notifications/send")
    .set("Authorization", `Bearer ${token}`)
    .send({ titulo: "Aviso", mensagem: "Mensagem de teste" });
  return res.body.data;
}

describe("POST /notifications/send", () => {
  it("cria notificação para o próprio usuário", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/notifications/send")
      .set("Authorization", `Bearer ${token}`)
      .send({ titulo: "Aviso", mensagem: "Teste" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.titulo).toBe("Aviso");
  });

  it("rejeita sem campos obrigatórios", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/notifications/send").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
});

describe("GET /notifications", () => {
  it("lista notificações paginadas", async () => {
    const token = await registerAndLogin();
    await criarNotificacao(token);
    await criarNotificacao(token);

    const res = await request(app).get("/notifications?page=1&limit=10").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it("não retorna notificações de outro usuário", async () => {
    const token1 = await registerAndLogin("n1@email.com");
    const token2 = await registerAndLogin("n2@email.com");
    await criarNotificacao(token1);

    const res = await request(app).get("/notifications").set("Authorization", `Bearer ${token2}`);
    expect(res.body.data.length).toBe(0);
  });
});

describe("GET /notifications/unread/count", () => {
  it("retorna contagem de não lidas", async () => {
    const token = await registerAndLogin();
    await criarNotificacao(token);
    await criarNotificacao(token);

    const res = await request(app).get("/notifications/unread/count").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(2);
  });
});

describe("PUT /notifications/:id (marcar como lida)", () => {
  it("marca notificação como lida", async () => {
    const token = await registerAndLogin();
    const notif = await criarNotificacao(token);

    const res = await request(app).put(`/notifications/${notif.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede marcar notificação de outro usuário", async () => {
    const token1 = await registerAndLogin("m1@email.com");
    const token2 = await registerAndLogin("m2@email.com");
    const notif = await criarNotificacao(token1);

    const res = await request(app).put(`/notifications/${notif.id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});

describe("PUT /notifications/mark-all-read", () => {
  it("marca todas as notificações como lidas", async () => {
    const token = await registerAndLogin();
    await criarNotificacao(token);
    await criarNotificacao(token);

    const res = await request(app).put("/notifications/mark-all-read").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const count = await request(app).get("/notifications/unread/count").set("Authorization", `Bearer ${token}`);
    expect(count.body.data.count).toBe(0);
  });
});

describe("DELETE /notifications/:id", () => {
  it("remove notificação com sucesso", async () => {
    const token = await registerAndLogin();
    const notif = await criarNotificacao(token);

    const res = await request(app).delete(`/notifications/${notif.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("impede remover notificação de outro usuário", async () => {
    const token1 = await registerAndLogin("o1@email.com");
    const token2 = await registerAndLogin("o2@email.com");
    const notif = await criarNotificacao(token1);

    const res = await request(app).delete(`/notifications/${notif.id}`).set("Authorization", `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});
