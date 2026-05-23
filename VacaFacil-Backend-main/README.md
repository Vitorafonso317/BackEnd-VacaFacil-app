# VacaFácil — Backend API

> API REST para gestão de fazendas leiteiras. Controle de rebanho, produção de leite, financeiro, reprodução, saúde animal, marketplace bovino e inteligência artificial — com autenticação JWT + Refresh Token e banco na nuvem via Turso.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.22-000000?logo=express)
![Turso](https://img.shields.io/badge/Turso-libSQL-4FF8D2)
![Jest](https://img.shields.io/badge/Jest-58_testes-C21325?logo=jest)

---

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js + Express | Framework HTTP |
| Turso (libSQL / SQLite) | Banco de dados na nuvem |
| JWT + Refresh Token | Autenticação stateless com rotação de tokens |
| bcryptjs | Hash de senhas |
| Cloudinary | Upload e otimização de imagens |
| compression (gzip) | Compressão de respostas HTTP (~70% redução) |
| express-validator | Validação de entrada |
| express-rate-limit | Rate limiting em endpoints de auth |
| Swagger UI | Documentação interativa em `/docs` |
| Jest + Supertest | Testes de integração com banco em memória |

---

## Instalação

```bash
git clone <url-do-repositorio>
cd VacaFacil-Backend-main

npm install

cp .env.example .env
# Preencha as variáveis no .env

npm run dev    # Desenvolvimento com nodemon
npm start      # Produção
```

---

## Variáveis de ambiente

```env
PORT=5000

# Banco de dados Turso (ou deixe vazio para SQLite local)
TURSO_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu_token_turso

# Autenticação
JWT_SECRET=sua_chave_jwt_segura

# Cloudinary (upload de imagens)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# CORS (opcional — domínios permitidos separados por vírgula)
ALLOWED_ORIGINS=http://localhost:8081
```

---

## Documentação interativa

Com o servidor rodando, acesse:

```
http://localhost:5000/docs
```

Para testar rotas protegidas:
1. `POST /auth/register` — cria uma conta
2. `POST /auth/login` — retorna `token` e `refreshToken`
3. Clique em **Authorize** e cole o token

---

## Endpoints

### Auth

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/register` | — | Registrar usuário |
| POST | `/auth/login` | — | Login — retorna JWT + refreshToken |
| POST | `/auth/refresh` | — | Renova access token via refreshToken |

### Usuários

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/users/me` | JWT | Dados do usuário logado |
| PUT | `/users/me` | JWT | Atualizar perfil |
| PUT | `/users/me/foto` | JWT | Upload de foto de perfil |
| DELETE | `/users/me` | JWT | Excluir conta |

### Vacas (Rebanho)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/vacas` | JWT | Listar rebanho (paginado) |
| POST | `/vacas` | JWT | Cadastrar vaca |
| GET | `/vacas/:id` | JWT | Buscar vaca por ID |
| PUT | `/vacas/:id` | JWT | Atualizar vaca |
| DELETE | `/vacas/:id` | JWT | Remover vaca |
| POST | `/vacas/:id/foto` | JWT | Upload de foto da vaca |

### Produção de Leite

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/producao` | JWT | Listar registros (paginado) |
| POST | `/producao` | JWT | Registrar produção (bloqueia se em carência) |
| PUT | `/producao/:id` | JWT | Atualizar registro |
| DELETE | `/producao/:id` | JWT | Remover registro |

### Financeiro

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/financeiro/receitas` | JWT | Listar receitas (paginado) |
| POST | `/financeiro/receitas` | JWT | Criar receita |
| PUT | `/financeiro/receitas/:id` | JWT | Atualizar receita |
| DELETE | `/financeiro/receitas/:id` | JWT | Remover receita |
| GET | `/financeiro/despesas` | JWT | Listar despesas (paginado) |
| POST | `/financeiro/despesas` | JWT | Criar despesa |
| PUT | `/financeiro/despesas/:id` | JWT | Atualizar despesa |
| DELETE | `/financeiro/despesas/:id` | JWT | Remover despesa |

### Reprodução

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/reproducao` | JWT | Listar eventos (paginado) |
| POST | `/reproducao` | JWT | Registrar evento |
| PUT | `/reproducao/:id` | JWT | Atualizar evento |
| DELETE | `/reproducao/:id` | JWT | Remover evento |

### Medicamentos e Carência

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/medicamentos` | JWT | Listar tratamentos |
| POST | `/medicamentos` | JWT | Registrar medicamento aplicado |
| GET | `/medicamentos/carencia-ativa` | JWT | Listar vacas em carência hoje |
| PUT | `/medicamentos/:id` | JWT | Atualizar tratamento |
| DELETE | `/medicamentos/:id` | JWT | Remover tratamento |

### Marketplace

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/marketplace` | — | Listar anúncios (paginado) |
| GET | `/marketplace/mine` | JWT | Meus anúncios |
| GET | `/marketplace/:id` | — | Buscar anúncio |
| POST | `/marketplace` | JWT | Criar anúncio (categoria: Bovino) |
| PUT | `/marketplace/:id` | JWT | Atualizar anúncio |
| DELETE | `/marketplace/:id` | JWT | Remover anúncio |
| POST | `/marketplace/:id/foto` | JWT | Adicionar foto (máx. 3) |

### Notificações

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/notifications` | JWT | Listar notificações (paginado) |
| GET | `/notifications/unread/count` | JWT | Total de não lidas |
| POST | `/notifications/send` | JWT | Criar notificação |
| PUT | `/notifications/mark-all-read` | JWT | Marcar todas como lidas |
| PUT | `/notifications/:id` | JWT | Marcar como lida |
| DELETE | `/notifications/:id` | JWT | Remover notificação |

### Assinaturas

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/subscriptions/plans` | — | Listar planos (Gratuito / Ouro / Diamante) |
| POST | `/subscriptions/subscribe` | JWT | Assinar plano |
| GET | `/subscriptions/status` | JWT | Status da assinatura |
| PUT | `/subscriptions/upgrade` | JWT | Trocar plano |
| DELETE | `/subscriptions/cancel` | JWT | Cancelar assinatura |

### Relatórios

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/relatorios/producao/json` | JWT | Relatório de produção |
| GET | `/relatorios/financeiro/json` | JWT | Relatório financeiro |
| GET | `/relatorios/completo/json` | JWT | Relatório completo |

### Machine Learning / IA

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/ml/predict-production` | JWT | Previsão de produção |
| GET | `/ml/analyze-performance` | JWT | Análise de desempenho do rebanho |
| GET | `/ml/detect-anomalies` | JWT | Detecção de anomalias na produção |
| GET | `/ml/recommendations` | JWT | Recomendações de manejo |
| GET | `/ml/financial-forecast` | JWT | Previsão financeira |
| GET | `/ml/insights` | JWT | Insights consolidados |

---

## Padrão de resposta

**Sucesso:**
```json
{
  "success": true,
  "message": "Vaca criada com sucesso",
  "data": { ... }
}
```

**Lista paginada:**
```json
{
  "success": true,
  "message": "Lista de vacas",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 34,
    "pages": 4
  }
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Email já cadastrado"
}
```

---

## Autenticação

O sistema usa **dois tokens**:

| Token | Expiração | Descrição |
|---|---|---|
| `token` (JWT) | 1 dia | Enviado no header `Authorization: Bearer <token>` |
| `refreshToken` | 30 dias | Armazenado no banco com rotação a cada uso |

Fluxo de renovação silenciosa:
1. Request retorna `401`
2. `api.ts` do frontend chama `POST /auth/refresh` com o `refreshToken`
3. API invalida o token antigo, gera um novo par e retorna
4. Request original é refeito com o novo `token`

---

## Banco de dados

Tabelas principais:

| Tabela | Descrição |
|---|---|
| `users` | Usuários da plataforma |
| `vacas` | Rebanho por usuário |
| `producao` | Registros diários de leite |
| `financeiro` | Receitas e despesas |
| `reproducao` | Eventos reprodutivos |
| `medicamentos_tratamentos` | Medicamentos aplicados e período de carência |
| `marketplace` | Anúncios de venda bovina (com lat/lon) |
| `notificacoes` | Notificações por usuário |
| `refresh_tokens` | Tokens de renovação com expiração |
| `planos` / `assinaturas` | Sistema de assinatura |

Índices criados automaticamente para as colunas mais consultadas (`user_id`, `vaca_id`, `data`, `categoria`).

---

## Segurança

- Senhas com **bcrypt** (salt 10)
- JWT com expiração de **1 dia**, refresh token de **30 dias** com rotação
- **Rate limiting** em `/auth/login` e `/auth/register` — 20 req / 15 min por IP
- **Validação de entrada** em todos os endpoints de escrita via `express-validator`
- **Isolamento por usuário** — cada usuário acessa apenas seus próprios dados
- **CORS** configurável via `ALLOWED_ORIGINS`
- **Gzip** em todas as respostas (~70% de redução no tráfego)

---

## Testes

```bash
npm test
```

```
Test Suites: 6 passed, 6 total
Tests:       58 passed, 58 total
```

| Suite | Cobertura |
|---|---|
| `auth.test.js` | Registro, login, validações |
| `users.test.js` | Perfil, atualização, exclusão |
| `cattle.test.js` | CRUD completo + isolamento entre usuários |
| `production.test.js` | CRUD completo + isolamento entre usuários |
| `financial.test.js` | Receitas, despesas + isolamento |
| `notifications.test.js` | Envio, leitura, contagem, exclusão |

> Os testes usam banco SQLite **em memória** — nunca tocam no banco de produção.

---

## Estrutura do projeto

```
src/
├── app.js                       # Express app (middlewares + rotas)
├── server.js                    # Inicialização do servidor
├── config/
│   └── swagger.js               # Spec OpenAPI/Swagger
├── database/
│   └── database.js              # Conexão Turso/SQLite + criação de tabelas + índices
├── middleware/
│   ├── authMiddleware.js        # Verificação JWT
│   ├── validateMiddleware.js    # Regras de validação por entidade
│   ├── uploadMiddleware.js      # Multer + upload Cloudinary
│   ├── errorMiddleware.js       # Handler global de erros
│   └── response.js              # Helpers ok / created / paginated / noData
├── controllers/                 # Recebem req/res, delegam para services
├── services/                    # Lógica de negócio
│   ├── authService.js           # Login, hash, geração de token par
│   ├── cattleService.js
│   ├── productionService.js
│   └── financialService.js
└── routes/                      # Definição de rotas por domínio
tests/
├── setup.js                     # Banco em memória + limpeza entre testes
└── *.test.js
```

---

## Scripts

```bash
npm run dev    # Desenvolvimento com nodemon (hot reload)
npm start      # Produção
npm test       # Suite de testes Jest
```

---

## Licença

Projeto proprietário — VacaFácil © 2025. Todos os direitos reservados.
