-- Restaura o FAQ padrão completo em bancos nos quais a pergunta sobre
-- personagens registrados foi o primeiro item persistido. Preserva qualquer
-- conteúdo já editado no painel administrativo.
INSERT INTO "FaqItem" ("id", "question", "answer", "sortOrder", "active", "createdAt", "updatedAt")
VALUES
  (
    'prazo-entrega',
    'Quanto tempo demora para receber o livro?',
    'Após a confirmação do pagamento e envio da foto, levamos de 10 a 15 dias úteis para gerar as imagens, revisar, imprimir e despachar. O prazo dos correios/transportadora varia conforme o seu CEP.',
    10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'ia-revisao-humana',
    'As ilustrações são feitas 100% por IA?',
    'Usamos IA como ferramenta, mas toda página passa por revisão humana da nossa equipe. Nada é publicado sem aprovação manual.',
    20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'fotos-publicas',
    'As fotos que envio ficam públicas?',
    'Não. Ficam em bucket privado com URL não-listada, marca d''água em qualquer preview público e são deletadas automaticamente 90 dias após a entrega. Você pode pedir exclusão antes disso.',
    30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'presente',
    'Sou avó/padrinho, posso comprar como presente?',
    'Sim. O fluxo é pensado pra adultos comprarem pra crianças queridas — pais, tios, padrinhos, avós. Você preenche tudo no wizard.',
    40, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'pagamento',
    'Quais formas de pagamento vocês aceitam?',
    'PIX (com desconto à vista), cartão de crédito com parcelamento sem juros em parcelas de 100 reais e boleto bancário via Mercado Pago.',
    50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'faixa-etaria',
    'Qual a faixa etária recomendada?',
    'De 0 a 10 anos. Oferecemos 3 faixas: 0-3 (histórias curtas, muitas imagens), 4-6 (aventuras simples), 7-10 (narrativas mais longas).',
    60, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'impressao',
    'O livro é impresso como?',
    'Livro no formato 21x30 cm com capa dura de laminação premium e impressão profissional com cores fiéis. Contém 20 páginas em papel couché brilho (170 g/m²) e excelente acabamento, com lombada firme e miolo colado, sem uso de costuras ou grampos.',
    70, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'fotos-ideais',
    'Como devem ser as fotos que vou enviar?',
    'A foto ideal deve ter boa iluminação (de preferência luz natural), mostrar o rosto da criança de frente, sem óculos escuros ou chapéus, com uma expressão neutra (e também uma sorrindo).',
    80, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'envio-brasil',
    'Vocês enviam pra todo o Brasil?',
    'Sim, para todos os CEPs atendidos pelos Correios e transportadoras parceiras da Melhor Envio.',
    90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'acompanhar-pedido',
    'Posso acompanhar o pedido?',
    'Sim. Pela área do cliente você vê a timeline (pagamento, produção, envio) e o código de rastreamento quando disponível. Também recebe atualizações por e-mail e WhatsApp (opcional).',
    100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'conta-obrigatoria',
    'Preciso criar conta pra comprar?',
    'Não é obrigatório — aceitamos checkout como convidado. Mas criar conta facilita acompanhar pedidos e refazer com os mesmos dados.',
    110, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'aprovacao-previa',
    'Eu aprovo a ilustração ou o livro antes da impressão?',
    'Sim! Assim que a história e as ilustrações estiverem prontas, enviaremos uma prévia do livro completo em PDF para a sua conferência. Nessa etapa, você poderá analisar cada detalhe e terá direito a solicitar uma rodada de revisões ou pequenos ajustes. Somente após essas possíveis mudanças e a sua aprovação final, o arquivo será encaminhado para a gráfica para ganhar vida no papel!',
    120, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'escolha-tema',
    'Posso escolher o tema ou o roteiro da história?',
    'Sim! Não trabalhamos com catálogos: cada livro é 100% sob medida e você escolhe todos os passos da história. Desde o tema até o roteiro, tudo é criado do zero, com a criança como protagonista em ilustrações feitas a partir de fotos reais. Para completar essa experiência totalmente exclusiva, você também adiciona uma dedicatória especial impressa nas primeiras páginas.',
    130, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'personagens-registrados',
    'Vocês usam personagens de filmes e desenhos animados?',
    'Não trabalhamos com personagens registrados por outras empresas (Elsa, Mickey, Homem-Aranha etc.), pois são protegidos por direitos autorais e não podem ser reproduzidos em produtos à venda. Mas a magia continua: criamos personagens originais inspirados no que seu filho ama — uma princesa do gelo só dele, um herói aranha exclusivo — ou usamos os clássicos livres, como Chapeuzinho, Cinderela, dragões, fadas e piratas.',
    140, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO NOTHING;
