// Vitest global setup — executado antes de cada arquivo de teste.
// Extensão: quando adicionar mocks globais (ex: mock do Prisma, vars de env para Sentry),
// colocá-los aqui ou em tests/setup/*.ts importados daqui.

// Garante isolamento nos testes unitários: não usa a chave real configurada em .env.local
process.env.RESEND_API_KEY = "";

