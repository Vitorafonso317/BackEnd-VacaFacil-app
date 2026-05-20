const request = require("supertest");
const app = require("../src/app");

async function registerAndLogin(emailOrData = "user@email.com") {
  const data = typeof emailOrData === "string"
    ? { nome: "User", email: emailOrData, password: "senha123" }
    : emailOrData;
  await request(app).post("/auth/register").send(data);
  const res = await request(app).post("/auth/login").send({ email: data.email, password: data.password });
  return res.body.data.token;
}

async function criarVaca(token, dados = {}) {
  const res = await request(app)
    .post("/vacas")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Mimosa", raca: "Holandesa", idade: 4, peso: 550, ...dados });
  return res.body.data;
}

module.exports = { registerAndLogin, criarVaca };
