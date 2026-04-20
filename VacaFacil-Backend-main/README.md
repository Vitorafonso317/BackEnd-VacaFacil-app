# VacaFácil — Backend API

API REST para gestão de fazendas leiteiras. Controle de rebanho, produção de leite, financeiro, reprodução, marketplace e muito mais.

## Stack

- Node.js + Express
- SQLite (via sqlite3)
- JWT para autenticação
- Swagger UI para documentação interativa
- Jest + Supertest para testes

---

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd VacaFacil-Backend-main

# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env
# Edite o .env e defina um JWT_SECRET seguro

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui
```

---

## Documentação Interativa

Com o servidor rodando, acesse:

```
http://localhost:5000/docs
```

O Swagger UI lista todos os endpoints com exemplos de request/response. Para testar rotas protegidas:

1. Faça `POST /auth/register` para criar uma conta
2. Faça `POST /auth/login` e copie o `token` da resposta
3. Clique em **Authorize** no topo da página e cole o token

---

## Endpoints

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Registrar usuário |
| POST | `/auth/login` | Login — retorna JWT |

### Usuários
| Método | Rota | Descrição |
|---|---|---|
| GET | `/users/me` | Dados do usuário logado |
| PUT | `/users/me` | Atualizar dados |
| DELETE | `/users/me` | Excluir conta |

### Vacas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/vacas` | Listar vacas (paginado) |
| POST | `/vacas` | Cadastrar vaca |
| GET | `/vacas/:id` | Buscar vaca por ID |
| PUT | `/vacas/:id` | Atualizar vaca |
| DELETE | `/vacas/:id` | Remover vaca |

### Produção
| Método | Rota | Descrição |
|---|---|---|
| GET | `/producao` | Listar registros (paginado) |
| POST | `/producao` | Registrar produção |
| PUT | `/producao/:id` | Atualizar registro |
| DELETE | `/producao/:id` | Remover registro |

### Financeiro
| Método | Rota | Descrição |
|---|---|---|
| GET | `/financeiro/receitas` | Listar receitas (paginado) |
| POST | `/financeiro/receitas` | Criar receita |
| PUT | `/financeiro/receitas/:id` | Atualizar receita |
| DELETE | `/financeiro/receitas/:id` | Remover receita |
| GET | `/financeiro/despesas` | Listar despesas (paginado) |
| POST | `/financeiro/despesas` | Criar despesa |
| PUT | `/financeiro/despesas/:id` | Atualizar despesa |
| DELETE | `/financeiro/despesas/:id` | Remover despesa |

### Reprodução
| Método | Rota | Descrição |
|---|---|---|
| GET | `/reproducao` | Listar eventos (paginado) |
| POST | `/reproducao` | Registrar evento |
| PUT | `/reproducao/:id` | Atualizar evento |
| DELETE | `/reproducao/:id` | Remover evento |

### Marketplace
| Método | Rota | Descrição |
|---|---|---|
| GET | `/marketplace` | Listar anúncios (paginado) |
| GET | `/marketplace/:id` | Buscar anúncio |
| POST | `/marketplace` | Criar anúncio |
| PUT | `/marketplace/:id` | Atualizar anúncio |
| DELETE | `/marketplace/:id` | Remover anúncio |

### Notificações
| Método | Rota | Descrição |
|---|---|---|
| GET | `/notifications` | Listar notificações (paginado) |
| POST | `/notifications/send` | Criar notificação |
| GET | `/notifications/unread/count` | Total de não lidas |
| PUT | `/notifications/mark-all-read` | Marcar todas como lidas |
| PUT | `/notifications/:id` | Marcar como lida |
| DELETE | `/notifications/:id` | Remover notificação |

### Assinaturas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/subscriptions/plans` | Listar planos disponíveis |
| POST | `/subscriptions/subscribe` | Assinar plano |
| GET | `/subscriptions/status` | Status da assinatura |
| PUT | `/subscriptions/upgrade` | Trocar plano |
| DELETE | `/subscriptions/cancel` | Cancelar assinatura |

### Relatórios
| Método | Rota | Descrição |
|---|---|---|
| GET | `/relatorios/producao/json` | Relatório de produção |
| GET | `/relatorios/financeiro/json` | Relatório financeiro |
| GET | `/relatorios/completo/json` | Relatório completo |

### ML / IA
| Método | Rota | Descrição |
|---|---|---|
| POST | `/ml/predict-production` | Previsão de produção |
| GET | `/ml/analyze-performance` | Análise de desempenho |
| GET | `/ml/detect-anomalies` | Detecção de anomalias |
| GET | `/ml/recommendations` | Recomendações |
| GET | `/ml/financial-forecast` | Previsão financeira |
| GET | `/ml/insights` | Insights gerais |

---

## Paginação

Todas as rotas de listagem aceitam query params:

```
GET /vacas?page=1&limit=10
```

Resposta:

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

---

## Padrão de Resposta

Todas as respostas seguem o mesmo formato:

**Sucesso:**
```json
{
  "success": true,
  "message": "Vaca criada com sucesso",
  "data": { ... }
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

## Testes

```bash
npm test
```

```
Test Suites: 6 passed, 6 total
Tests:       58 passed, 58 total
```

Cobertura:

- `auth.test.js` — registro, login, validações
- `users.test.js` — perfil, atualização, exclusão
- `cattle.test.js` — CRUD completo + isolamento entre usuários
- `production.test.js` — CRUD completo + isolamento entre usuários
- `financial.test.js` — receitas e despesas + isolamento entre usuários
- `notifications.test.js` — envio, leitura, contagem, exclusão

Os testes usam banco SQLite em memória — nunca tocam no `database.sqlite` de produção.

---

## Segurança

- Senhas com bcrypt (salt 10)
- JWT com expiração de 7 dias
- Rate limiting em `/auth/login` e `/auth/register` — 20 requisições por IP a cada 15 minutos
- Validação de entrada em todos os endpoints de escrita
- Isolamento de dados por usuário — cada usuário acessa apenas seus próprios recursos

---

## Estrutura do Projeto

```
src/
├── config/
│   └── swagger.js          # Documentação Swagger
├── controllers/            # Recebem request/response
├── services/               # Lógica de negócio
│   ├── authService.js
│   ├── cattleService.js
│   ├── productionService.js
│   └── financialService.js
├── middleware/
│   ├── authMiddleware.js   # Verificação JWT
│   ├── validateMiddleware.js # Validação de entrada
│   ├── errorMiddleware.js  # Tratamento de erros
│   └── response.js         # Helpers de resposta padronizada
├── routes/                 # Definição de rotas
├── database/
│   └── database.js         # Conexão e criação de tabelas SQLite
├── app.js
└── server.js
tests/
├── setup.js                # Banco em memória + limpeza
├── auth.test.js
├── users.test.js
├── cattle.test.js
├── production.test.js
├── financial.test.js
└── notifications.test.js
```

---

## Scripts

```bash
npm run dev    # Desenvolvimento com nodemon
npm start      # Produção
npm test       # Testes com Jest
```
