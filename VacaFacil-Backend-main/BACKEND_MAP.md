# VacaFácil Backend - Mapa do Projeto

## Estrutura de Arquivos

```
VacaFacil-Backend-main/
├── src/
│   ├── controllers/              # Lógica de cada domínio
│   │   ├── authController.js     # register, login
│   │   ├── userController.js     # perfil, atualização, exclusão de conta
│   │   ├── cattleController.js   # CRUD de vacas
│   │   ├── productionController.js # CRUD de registros de produção de leite
│   │   ├── financeiroController.js # CRUD financeiro (receitas/despesas)
│   │   ├── reproducaoController.js # CRUD de eventos reprodutivos
│   │   ├── marketplaceController.js # CRUD de anúncios
│   │   ├── notificacoesController.js # CRUD de notificações
│   │   ├── assinaturasController.js  # Planos e assinaturas
│   │   ├── relatoriosController.js   # Relatórios agregados
│   │   └── mlController.js       # IA/ML: previsões e insights
│   ├── services/                 # Camada de serviço (domínios com mais lógica)
│   │   ├── authService.js        # Hashing de senha, geração de JWT
│   │   ├── cattleService.js      # Regras de negócio de rebanho
│   │   ├── productionService.js  # Regras de produção de leite
│   │   └── financialService.js   # Regras financeiras
│   ├── routes/                   # Definição das rotas e middlewares por módulo
│   │   ├── authRoutes.js         # /auth
│   │   ├── userRoutes.js         # /users
│   │   ├── cattleRoutes.js       # /vacas
│   │   ├── productionRoutes.js   # /producao
│   │   ├── financeiroRoutes.js   # /financeiro
│   │   ├── reproducaoRoutes.js   # /reproducao
│   │   ├── marketplaceRoutes.js  # /marketplace
│   │   ├── notificacoesRoutes.js # /notifications
│   │   ├── assinaturasRoutes.js  # /subscriptions
│   │   ├── relatoriosRoutes.js   # /relatorios
│   │   └── mlRoutes.js           # /ml
│   ├── middleware/
│   │   ├── authMiddleware.js     # Validação do JWT Bearer
│   │   ├── validateMiddleware.js # Regras de validação por rota (express-validator)
│   │   ├── uploadMiddleware.js   # Upload de imagens com multer
│   │   ├── response.js           # Helpers: ok, created, noData, paginated
│   │   └── errorHandler.js       # Handler global de erros
│   ├── database/
│   │   └── database.js           # Conexão SQLite + helpers (get, query, run)
│   ├── models/
│   │   └── User.js               # (reservado para constantes/validações do usuário)
│   ├── docs/
│   │   └── swagger.js            # Configuração Swagger/OpenAPI
│   ├── app.js                    # Express app, middlewares globais, rotas
│   └── server.js                 # Ponto de entrada, inicia o servidor
├── tests/                        # Suites Jest + Supertest
│   ├── auth.test.js
│   ├── users.test.js
│   ├── cattle.test.js
│   ├── production.test.js
│   ├── financial.test.js
│   ├── notifications.test.js
│   ├── reproducao.test.js
│   ├── marketplace.test.js
│   ├── assinaturas.test.js
│   ├── relatorios.test.js
│   └── ml.test.js
├── .env                          # Variáveis de ambiente (não versionar)
├── .env.example                  # Modelo de variáveis de ambiente
├── jest.config.json
├── package.json
└── README.md
```

## Endpoints

### Autenticação (`/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro de novo usuário |
| POST | `/auth/login` | Login, retorna JWT |

### Usuários (`/users`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/users/me` | ✅ | Perfil do usuário autenticado |
| PUT | `/users/me` | ✅ | Atualizar nome/email/senha |
| DELETE | `/users/me` | ✅ | Excluir conta |
| POST | `/users/me/photo` | ✅ | Upload de foto de perfil |

### Rebanho (`/vacas`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/vacas` | ✅ | Listar vacas (paginado) |
| POST | `/vacas` | ✅ | Cadastrar vaca |
| GET | `/vacas/:id` | ✅ | Buscar vaca por ID |
| PUT | `/vacas/:id` | ✅ | Atualizar vaca |
| DELETE | `/vacas/:id` | ✅ | Remover vaca |
| POST | `/vacas/:id/photo` | ✅ | Upload de foto da vaca |

### Produção de Leite (`/producao`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/producao` | ✅ | Listar registros (paginado) |
| POST | `/producao` | ✅ | Registrar produção |
| GET | `/producao/:id` | ✅ | Buscar registro |
| PUT | `/producao/:id` | ✅ | Atualizar registro |
| DELETE | `/producao/:id` | ✅ | Remover registro |

### Financeiro (`/financeiro`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/financeiro` | ✅ | Listar lançamentos (paginado) |
| POST | `/financeiro` | ✅ | Criar lançamento |
| GET | `/financeiro/:id` | ✅ | Buscar lançamento |
| PUT | `/financeiro/:id` | ✅ | Atualizar lançamento |
| DELETE | `/financeiro/:id` | ✅ | Remover lançamento |

### Reprodução (`/reproducao`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/reproducao` | ✅ | Listar eventos (paginado) |
| POST | `/reproducao` | ✅ | Registrar evento |
| PUT | `/reproducao/:id` | ✅ | Atualizar evento |
| DELETE | `/reproducao/:id` | ✅ | Remover evento |

### Marketplace (`/marketplace`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/marketplace` | ❌ | Listar anúncios (público, paginado) |
| GET | `/marketplace/:id` | ❌ | Ver anúncio (público) |
| POST | `/marketplace` | ✅ | Criar anúncio |
| PUT | `/marketplace/:id` | ✅ | Atualizar anúncio (somente dono) |
| DELETE | `/marketplace/:id` | ✅ | Remover anúncio (somente dono) |

### Notificações (`/notifications`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/notifications` | ✅ | Listar notificações |
| PUT | `/notifications/:id/read` | ✅ | Marcar como lida |
| DELETE | `/notifications/:id` | ✅ | Remover notificação |

### Assinaturas (`/subscriptions`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/subscriptions/plans` | ❌ | Listar planos disponíveis |
| POST | `/subscriptions/subscribe` | ✅ | Assinar um plano |
| GET | `/subscriptions/status` | ✅ | Status da assinatura atual |
| PUT | `/subscriptions/upgrade` | ✅ | Trocar de plano |
| DELETE | `/subscriptions/cancel` | ✅ | Cancelar assinatura |

### Relatórios (`/relatorios`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/relatorios/producao/json` | ✅ | Relatório de produção de leite |
| GET | `/relatorios/financeiro/json` | ✅ | Relatório financeiro |
| GET | `/relatorios/completo/json` | ✅ | Relatório completo da fazenda |

### ML / IA (`/ml`)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/ml/predict-production` | ✅ | Previsão de produção (média dos últimos 30 dias) |
| GET | `/ml/analyze-performance` | ✅ | Análise de desempenho do rebanho |
| GET | `/ml/detect-anomalies` | ✅ | Detecção de anomalias |
| GET | `/ml/recommendations` | ✅ | Recomendações geradas |
| GET | `/ml/financial-forecast` | ✅ | Previsão financeira |
| GET | `/ml/insights` | ✅ | Insights gerais |

## Banco de Dados (SQLite)

### Tabelas principais
| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `vacas` | Rebanho por usuário |
| `producao` | Registros de produção de leite |
| `financeiro` | Lançamentos financeiros |
| `reproducao` | Eventos reprodutivos |
| `marketplace` | Anúncios públicos |
| `notificacoes` | Notificações por usuário |
| `planos` | Planos de assinatura |
| `assinaturas` | Assinaturas ativas (1 por usuário) |

## Variáveis de Ambiente

```bash
PORT=5000                        # Porta do servidor
JWT_SECRET=sua_chave_secreta     # Chave de assinatura JWT
JWT_EXPIRES_IN=7d                # Validade do token
NODE_ENV=development             # Ambiente (development | production)
ALLOWED_ORIGINS=http://localhost:8081  # Origens permitidas no CORS
```

## Scripts

```bash
npm run dev    # Desenvolvimento com nodemon
npm start      # Produção com node
npm test       # Testes com Jest
```
