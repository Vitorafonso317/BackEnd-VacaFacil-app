const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VacaFácil API",
      version: "1.0.0",
      description: "API de gestão de fazendas leiteiras",
    },
    servers: [{ url: "http://localhost:5000", description: "Desenvolvimento" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            pages: { type: "integer" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nome: { type: "string" },
            email: { type: "string" },
            created_at: { type: "string" },
            last_login: { type: "string" },
          },
        },
        Vaca: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nome: { type: "string" },
            raca: { type: "string" },
            idade: { type: "integer" },
            peso: { type: "number" },
            status_saude: { type: "string", enum: ["saudavel", "doente", "em_tratamento"] },
          },
        },
        Producao: {
          type: "object",
          properties: {
            id: { type: "integer" },
            vaca_id: { type: "integer" },
            data: { type: "string", format: "date" },
            litros: { type: "number" },
            observacoes: { type: "string" },
          },
        },
        Financeiro: {
          type: "object",
          properties: {
            id: { type: "integer" },
            tipo: { type: "string", enum: ["receita", "despesa"] },
            descricao: { type: "string" },
            valor: { type: "number" },
            data: { type: "string", format: "date" },
          },
        },
        Reproducao: {
          type: "object",
          properties: {
            id: { type: "integer" },
            vaca_id: { type: "integer" },
            tipo_evento: { type: "string" },
            data: { type: "string", format: "date" },
            observacoes: { type: "string" },
          },
        },
        Marketplace: {
          type: "object",
          properties: {
            id: { type: "integer" },
            titulo: { type: "string" },
            descricao: { type: "string" },
            preco: { type: "number" },
            categoria: { type: "string" },
            user_id: { type: "integer" },
          },
        },
        Notificacao: {
          type: "object",
          properties: {
            id: { type: "integer" },
            titulo: { type: "string" },
            mensagem: { type: "string" },
            lida: { type: "integer", enum: [0, 1] },
            created_at: { type: "string" },
          },
        },
        Plano: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nome: { type: "string" },
            preco: { type: "number" },
            descricao: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Registrar usuário",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nome", "email", "password"],
                  properties: {
                    nome: { type: "string", example: "João Silva" },
                    email: { type: "string", example: "joao@email.com" },
                    password: { type: "string", minLength: 6, example: "senha123" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Usuário criado" },
            400: { description: "Dados inválidos" },
            409: { description: "Email já cadastrado" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "joao@email.com" },
                    password: { type: "string", example: "senha123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Token JWT retornado" },
            401: { description: "Credenciais inválidas" },
          },
        },
      },
      "/users/me": {
        get: {
          tags: ["Usuários"],
          summary: "Dados do usuário logado",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Dados do usuário" } },
        },
        put: {
          tags: ["Usuários"],
          summary: "Atualizar dados do usuário",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nome: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Atualizado" } },
        },
        delete: {
          tags: ["Usuários"],
          summary: "Excluir conta",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Conta excluída" } },
        },
      },
      "/vacas": {
        get: {
          tags: ["Vacas"],
          summary: "Listar vacas",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Lista paginada de vacas" } },
        },
        post: {
          tags: ["Vacas"],
          summary: "Criar vaca",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nome"],
                  properties: {
                    nome: { type: "string", example: "Mimosa" },
                    raca: { type: "string", example: "Holandesa" },
                    idade: { type: "integer", example: 4 },
                    peso: { type: "number", example: 550 },
                    status_saude: { type: "string", example: "saudavel" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Vaca criada" } },
        },
      },
      "/vacas/{id}": {
        get: {
          tags: ["Vacas"],
          summary: "Buscar vaca por ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Vaca encontrada" }, 404: { description: "Não encontrada" } },
        },
        put: {
          tags: ["Vacas"],
          summary: "Atualizar vaca",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Vaca" },
              },
            },
          },
          responses: { 200: { description: "Atualizada" }, 404: { description: "Não encontrada" } },
        },
        delete: {
          tags: ["Vacas"],
          summary: "Remover vaca",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Removida" }, 404: { description: "Não encontrada" } },
        },
      },
      "/producao": {
        get: {
          tags: ["Produção"],
          summary: "Listar produções",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Lista paginada" } },
        },
        post: {
          tags: ["Produção"],
          summary: "Registrar produção",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["vaca_id", "data", "litros"],
                  properties: {
                    vaca_id: { type: "integer", example: 1 },
                    data: { type: "string", format: "date", example: "2025-01-15" },
                    litros: { type: "number", example: 25.5 },
                    observacoes: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Produção registrada" } },
        },
      },
      "/producao/{id}": {
        put: {
          tags: ["Produção"],
          summary: "Atualizar produção",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Atualizada" } },
        },
        delete: {
          tags: ["Produção"],
          summary: "Remover produção",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Removida" } },
        },
      },
      "/financeiro/receitas": {
        get: {
          tags: ["Financeiro"],
          summary: "Listar receitas",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Lista paginada" } },
        },
        post: {
          tags: ["Financeiro"],
          summary: "Criar receita",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["descricao", "valor", "data"],
                  properties: {
                    descricao: { type: "string", example: "Venda de leite" },
                    valor: { type: "number", example: 500.0 },
                    data: { type: "string", format: "date", example: "2025-01-15" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Receita criada" } },
        },
      },
      "/financeiro/receitas/{id}": {
        put: {
          tags: ["Financeiro"],
          summary: "Atualizar receita",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Atualizada" } },
        },
        delete: {
          tags: ["Financeiro"],
          summary: "Remover receita",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Removida" } },
        },
      },
      "/financeiro/despesas": {
        get: {
          tags: ["Financeiro"],
          summary: "Listar despesas",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Lista paginada" } },
        },
        post: {
          tags: ["Financeiro"],
          summary: "Criar despesa",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["descricao", "valor", "data"],
                  properties: {
                    descricao: { type: "string", example: "Ração" },
                    valor: { type: "number", example: 200.0 },
                    data: { type: "string", format: "date", example: "2025-01-15" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Despesa criada" } },
        },
      },
      "/financeiro/despesas/{id}": {
        put: {
          tags: ["Financeiro"],
          summary: "Atualizar despesa",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Atualizada" } },
        },
        delete: {
          tags: ["Financeiro"],
          summary: "Remover despesa",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Removida" } },
        },
      },
      "/reproducao": {
        get: {
          tags: ["Reprodução"],
          summary: "Listar eventos reprodutivos",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Lista paginada" } },
        },
        post: {
          tags: ["Reprodução"],
          summary: "Registrar evento reprodutivo",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["vaca_id", "tipo_evento", "data"],
                  properties: {
                    vaca_id: { type: "integer", example: 1 },
                    tipo_evento: { type: "string", example: "inseminacao" },
                    data: { type: "string", format: "date", example: "2025-01-15" },
                    observacoes: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Evento registrado" } },
        },
      },
      "/reproducao/{id}": {
        put: {
          tags: ["Reprodução"],
          summary: "Atualizar evento",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Atualizado" } },
        },
        delete: {
          tags: ["Reprodução"],
          summary: "Remover evento",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Removido" } },
        },
      },
      "/marketplace": {
        get: {
          tags: ["Marketplace"],
          summary: "Listar anúncios",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Lista paginada" } },
        },
        post: {
          tags: ["Marketplace"],
          summary: "Criar anúncio",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["titulo", "preco"],
                  properties: {
                    titulo: { type: "string", example: "Vaca Holandesa" },
                    descricao: { type: "string" },
                    preco: { type: "number", example: 3500.0 },
                    categoria: { type: "string", example: "bovinos" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Anúncio criado" } },
        },
      },
      "/marketplace/{id}": {
        get: {
          tags: ["Marketplace"],
          summary: "Buscar anúncio por ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Anúncio encontrado" } },
        },
        put: {
          tags: ["Marketplace"],
          summary: "Atualizar anúncio",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Atualizado" } },
        },
        delete: {
          tags: ["Marketplace"],
          summary: "Remover anúncio",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Removido" } },
        },
      },
      "/notifications": {
        get: {
          tags: ["Notificações"],
          summary: "Listar notificações",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Lista paginada" } },
        },
      },
      "/notifications/send": {
        post: {
          tags: ["Notificações"],
          summary: "Enviar notificação para si mesmo",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["titulo", "mensagem"],
                  properties: {
                    titulo: { type: "string" },
                    mensagem: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Notificação enviada" } },
        },
      },
      "/notifications/unread/count": {
        get: {
          tags: ["Notificações"],
          summary: "Total de não lidas",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Contagem" } },
        },
      },
      "/notifications/mark-all-read": {
        put: {
          tags: ["Notificações"],
          summary: "Marcar todas como lidas",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Marcadas" } },
        },
      },
      "/notifications/{id}": {
        put: {
          tags: ["Notificações"],
          summary: "Marcar notificação como lida",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Marcada" } },
        },
        delete: {
          tags: ["Notificações"],
          summary: "Remover notificação",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Removida" } },
        },
      },
      "/subscriptions/plans": {
        get: {
          tags: ["Assinaturas"],
          summary: "Listar planos disponíveis",
          responses: { 200: { description: "Lista de planos" } },
        },
      },
      "/subscriptions/subscribe": {
        post: {
          tags: ["Assinaturas"],
          summary: "Assinar plano",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["plano_id"],
                  properties: { plano_id: { type: "integer", example: 2 } },
                },
              },
            },
          },
          responses: { 201: { description: "Assinado" } },
        },
      },
      "/subscriptions/status": {
        get: {
          tags: ["Assinaturas"],
          summary: "Status da assinatura",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Status atual" } },
        },
      },
      "/subscriptions/upgrade": {
        put: {
          tags: ["Assinaturas"],
          summary: "Trocar plano",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Plano atualizado" } },
        },
      },
      "/subscriptions/cancel": {
        delete: {
          tags: ["Assinaturas"],
          summary: "Cancelar assinatura",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Cancelada" } },
        },
      },
      "/relatorios/producao/json": {
        get: {
          tags: ["Relatórios"],
          summary: "Relatório de produção",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Dados de produção" } },
        },
      },
      "/relatorios/financeiro/json": {
        get: {
          tags: ["Relatórios"],
          summary: "Relatório financeiro",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Dados financeiros" } },
        },
      },
      "/relatorios/completo/json": {
        get: {
          tags: ["Relatórios"],
          summary: "Relatório completo",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Todos os dados consolidados" } },
        },
      },
      "/ml/predict-production": {
        post: {
          tags: ["ML / IA"],
          summary: "Previsão de produção",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Previsão calculada" } },
        },
      },
      "/ml/analyze-performance": {
        get: {
          tags: ["ML / IA"],
          summary: "Análise de desempenho",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Análise" } },
        },
      },
      "/ml/detect-anomalies": {
        get: {
          tags: ["ML / IA"],
          summary: "Detecção de anomalias",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Anomalias detectadas" } },
        },
      },
      "/ml/recommendations": {
        get: {
          tags: ["ML / IA"],
          summary: "Recomendações",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Lista de recomendações" } },
        },
      },
      "/ml/financial-forecast": {
        get: {
          tags: ["ML / IA"],
          summary: "Previsão financeira",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Previsão" } },
        },
      },
      "/ml/insights": {
        get: {
          tags: ["ML / IA"],
          summary: "Insights gerais",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Insights" } },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
