ALTER TABLE "Order" ADD COLUMN "guestCpf" TEXT;

INSERT INTO "FaqItem" ("id", "question", "answer", "sortOrder", "active", "createdAt", "updatedAt")
VALUES (
  'personagens-registrados',
  'Vocês usam personagens de filmes e desenhos animados?',
  'Não trabalhamos com personagens registrados por outras empresas (Elsa, Mickey, Homem-Aranha etc.), pois são protegidos por direitos autorais e não podem ser reproduzidos em produtos à venda. Mas a magia continua: criamos personagens originais inspirados no que seu filho ama — uma princesa do gelo só dele, um herói aranha exclusivo — ou usamos os clássicos livres, como Chapeuzinho, Cinderela, dragões, fadas e piratas.',
  140,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET
  "question" = EXCLUDED."question",
  "answer" = EXCLUDED."answer",
  "sortOrder" = EXCLUDED."sortOrder",
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
