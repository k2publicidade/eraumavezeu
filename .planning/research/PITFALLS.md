# Pitfalls Research

**Domain:** E-commerce BR de produto personalizado com upload de fotos de crianças (Era Uma Vez Eu)
**Researched:** 2026-04-18
**Confidence:** HIGH (pitfalls verificados em docs oficiais MP/Supabase/Vercel/ANPD + fontes comunitárias convergentes)

> Este documento lista apenas armadilhas **específicas deste domínio** (e-commerce BR + fotos de crianças + wizard + IA humana-in-the-loop + Mercado Pago + Melhor Envio + Evolution API). Armadilhas genéricas de webdev (XSS, CSRF, etc.) estão **fora do escopo**; assume-se OWASP básico já coberto.

---

## Critical Pitfalls

### Pitfall 1: Webhook Mercado Pago sem idempotência + sem validação de assinatura

**What goes wrong:**
Mercado Pago **envia o mesmo webhook múltiplas vezes** (at-least-once delivery, não exactly-once) e o handler ingênuo — `if (payment.status === 'approved') criarPedido()` — duplica pedidos, dispara e-mails/WhatsApp duplicados, e contabiliza receita em dobro. Pior: sem validar `x-signature`, qualquer atacante consegue chamar `/api/webhook/mercadopago` com `status: approved` e **marcar pedidos como pagos sem ter pago nada**.

**Why it happens:**
1. MP documenta webhooks como "receba notificações de pagamento", mas a cláusula sobre retry/duplicação fica em nota de rodapé.
2. Exemplos de tutorial BR (incluindo o próprio prompt original deste projeto) omitem HMAC validation.
3. Developer confia no `body.data.id` e no `status` vindo no payload em vez de **re-buscar o pagamento na API** para confirmar.

**How to avoid:**
- **Obrigatório:** validar `x-signature` (HMAC-SHA256 com template `id:{data.id};request-id:{x-request-id};ts:{ts};` e `MP_WEBHOOK_SECRET` como chave). Rejeitar com 401 se não bater.
- **Obrigatório:** re-buscar o pagamento via `payment.get({ id: notification.data.id })` — nunca confiar no payload bruto.
- **Obrigatório:** tabela `ProcessedWebhook(paymentId UNIQUE, processedAt)` ou constraint `UNIQUE` em `Order.paymentId` para dedup atômico. Usar `INSERT ... ON CONFLICT DO NOTHING` antes de processar.
- Retornar **200 em menos de 22s** (timeout do MP). Se precisar trabalho pesado, responda 200 e enfileire.
- Responder 200 mesmo em erro de negócio conhecido (ex: pedido já processado) — só retorne 5xx em falha real, pois MP re-envia em não-2xx.

**Warning signs:**
- Dois e-mails de "pagamento aprovado" para o mesmo pedido em ambiente de teste.
- Dashboard admin mostrando mesmo `paymentId` em 2+ Orders.
- Sentry: erros de `UNIQUE constraint violation` no webhook (= dedup funcionando, mas mostra que duplicação é real).
- Em produção: cliente reclamando "fui cobrado 1 vez, mas aparecem 2 pedidos".

**Phase to address:** Fase 4 (Checkout + Pagamento). **Bloqueante antes de deploy.**

---

### Pitfall 2: LGPD — retenção indefinida e bucket público de fotos de crianças

**What goes wrong:**
O wizard recebe até 4 fotos de crianças reais. Se o bucket Supabase/Uploadthing estiver **público** (URL previsível ou listável), fotos de menores ficam expostas. Pior: sem política de retenção, fotos ficam **para sempre** no storage mesmo após entrega do livro, violando LGPD Art. 14 (tratamento de dados de crianças exige **finalidade específica** e **consentimento destacado do responsável**) e Art. 16 (eliminação após término do tratamento).

**Why it happens:**
1. Tutorial-ware: developer cria bucket "public" porque `createSignedUrl` é chato.
2. Foco em funcionalidade > compliance; LGPD é deixada para "depois".
3. Confusão entre "URL obscura" e "URL privada" — URL não-listada em Google ainda é acessível por quem tiver.
4. Falta de job de limpeza — fotos ficam órfãs quando pedido é cancelado/reembolsado.

**How to avoid:**
- **Bucket privado** no Supabase Storage com RLS habilitado. Nenhum acesso público direto.
- **Signed URLs com TTL curto** (ex: 15min) para preview no admin. Re-gerar a cada acesso.
- **Checkbox explícito no Passo 6** (upload): "Declaro ser responsável legal pela criança e autorizo o uso das fotos exclusivamente para produção do livro, com retenção de até 90 dias após a entrega." Guardar `consentGivenAt`, `consentText`, `consentIp` no banco.
- **Job de retenção** (Vercel Cron diário): apagar fotos de Orders com status `ENTREGUE` ou `CANCELADO` há mais de 90 dias. Logar cada deleção (auditoria ANPD).
- **Endpoint de direito de exclusão** (`DELETE /api/cliente/fotos/:orderId`) para atender pedido de eliminação (LGPD Art. 18).
- **Política de privacidade pública** descrevendo dados coletados, finalidade, prazo, DPO — link no rodapé e no Passo 6.
- **Marca d'água em TODA preview** (incluindo admin), não só no site público — protege contra leak interno.
- Nunca enviar foto de criança em e-mail/WhatsApp sem marca d'água (e-mail pode vazar).

**Warning signs:**
- URLs do bucket abrem sem autenticação quando coladas em aba anônima.
- Não existe coluna `consentGivenAt` no schema.
- Pedidos com 6+ meses ainda têm fotos no storage.
- Cliente pede para apagar dados e a equipe não sabe como.
- Nenhum DPO/responsável LGPD identificado no site.

**Phase to address:** Fase 3 (Upload + Wizard). **Bloqueante — risco legal + reputacional crítico para produto de crianças.**

---

### Pitfall 3: Evolution API ban do WhatsApp em produção

**What goes wrong:**
Evolution API usa protocolo **não oficial do WhatsApp Web (Baileys)**. Contas novas usadas para enviar mensagens automáticas frequentemente são banidas em **2 a 8 semanas**. Mensagem de template genérica enviada em volume (ex: "🌟 Era Uma Vez Eu, seu pedido...") aciona heurística de spam da Meta. Pior: a equipe de suporte usa o MESMO número para responder clientes — quando bana, perde-se **todo o histórico de atendimento**.

**Why it happens:**
1. Economia — API oficial do WhatsApp Business custa ~R$ 0,09/msg utility + mensalidade de BSP. Evolution é "grátis".
2. Tutoriais brasileiros empurram Evolution/Baileys sem mencionar risco de ban.
3. Meta aumentou enforcement em 2025-2026 — contas que duravam anos agora caem em semanas.
4. Dev usa o número pessoal do fundador como instância "para testar" e quando o volume cresce, é tarde.

**How to avoid:**
- **Não usar o número principal da empresa.** Instância Evolution deve estar em chip dedicado, "queimável".
- **Aquecer o chip** (warmup) antes de volume: enviar mensagens manuais para contatos salvos por 2-3 semanas.
- **Limitar velocidade**: max 1 msg a cada 10-30s, jitter aleatório, respeitar horário comercial (8h-22h).
- **Mensagens variadas** — evitar template idêntico palavra-por-palavra. Personalizar com nome, variar emojis/saudação.
- **Fallback obrigatório:** se WhatsApp falhar, cair para e-mail + SMS (Twilio/Zenvia). Nunca ser o único canal.
- **Status de ban detectável:** monitorar instância Evolution (`/instance/connectionState`). Se `close` persistir > 5min, alertar Sentry/e-mail.
- **Plano de migração**: desde o dia 1, arquitetar `lib/whatsapp.ts` como interface trocável (`sendMessage(to, text)`) para plugar WhatsApp Cloud API oficial quando crescer.
- **Opt-in explícito** no checkout: "Receber notificações por WhatsApp" (não-ticado por default) — envios não-consentidos aceleram ban.

**Warning signs:**
- QR code pedindo re-scan após poucos dias.
- Taxa de entrega caindo (`read: false` em 30%+ das mensagens).
- Cliente responde "quem é esse número?" — bot está usando número não reconhecido.
- Evolution logs mostrando `challenge` ou `device_removed`.

**Phase to address:** Fase 5 (Comunicação). Design da interface trocável na Fase 1. **Ter plano B antes de depender.**

---

### Pitfall 4: Sharp na Vercel — OOM e timeout no watermark

**What goes wrong:**
Sharp carrega a imagem em memória. Foto de iPhone moderna: 4032×3024 ≈ 12MP ≈ **50-80MB em memória descomprimida**. 4 fotos processadas em paralelo no plano Hobby (1GB de RAM padrão em funções) estoura o heap → função é morta com "out of memory" que aparece no log como **timeout genérico** (enganoso). Também: bundle do Sharp com binários nativos pode passar de 250MB (limite descomprimido da Vercel), quebrando build.

**Why it happens:**
1. Dev testa em dev local (16GB RAM) → funciona. Deploy Vercel Hobby (1GB default) → quebra.
2. OOM na Vercel é mascarado como timeout; developer otimiza tempo em vez de memória.
3. Sharp 0.33+ usa sharp-libvips-* (plataforma-específicos) — esquecer `@vercel/og`/`sharp` config + `includeFiles` estoura 250MB.
4. Processa imagens sequencialmente no webhook síncrono — cliente espera 30s e timeout de 10s Hobby estoura.

**How to avoid:**
- **Redimensionar ANTES de aplicar marca d'água**: `sharp(buffer).resize(1200, null, { withoutEnlargement: true })` — reduz memória em ordem de magnitude.
- **Configurar memória da função** no `vercel.json` ou via config export: mínimo 1769MB (aloca 1 vCPU full) para endpoints de imagem.
- **`maxDuration: 60`** (Pro) ou `30` (Hobby) nas rotas de processamento; default de 10s é pouco.
- **Processar fora do path crítico:** upload → salva original → enfileira watermark → gera versão pública com marca d'água assíncrono. Cliente não espera.
- **Usar Uploadthing transformations** ou **Vercel Image Optimization** onde possível em vez de Sharp custom.
- **Teste de carga local simulando Vercel**: rodar `node --max-old-space-size=900` para reproduzir limite.
- **Não processar lotes > 2 imagens em paralelo** na mesma função.
- **Flag de fluidez (Fluid Compute)** na Pro — permite até 800s + concorrência otimizada.

**Warning signs:**
- Funções `/api/watermark` com erros `FUNCTION_INVOCATION_TIMEOUT` intermitentes (especialmente em horários de pico).
- Build Vercel: aviso `Serverless Function size exceeded 250MB unzipped`.
- Sentry mostrando stack trace cortada no meio do Sharp (= crash do processo).
- Imagem salva mas URL retorna 500 na primeira visualização.

**Phase to address:** Fase 3 (Upload + Marca d'água). Benchmark obrigatório antes de ir para Fase 4.

---

### Pitfall 5: Wizard de 7 passos — perda de dados em mobile Safari

**What goes wrong:**
O wizard usa `localStorage` para persistir progresso. Mobile Safari em modo privado **não permite localStorage** (retorna QuotaExceededError). Pior: Safari iOS purga localStorage quando armazenamento fica apertado (chamado "storage eviction"). Cliente no celular preenche 5 passos, recebe chamada, volta ao site 10 minutos depois, **perde tudo**, fecha a aba. Abandono silencioso sem nenhum log.

Complicação adicional: fotos (até 4, 10MB cada) **não cabem em localStorage** (limite ~5-10MB total). Tentar stringify de Blob/base64 estoura quota.

**Why it happens:**
1. Dev testa em Chrome desktop → tudo funciona.
2. localStorage é usado como "fire and forget" sem try/catch + fallback.
3. Fotos são armazenadas como base64 no state e persistidas junto — estoura quota.
4. Não há analytics de abandono por etapa — problema invisível.

**How to avoid:**
- **Try/catch em toda operação de localStorage** + feature detection (`try { localStorage.setItem('test','1'); localStorage.removeItem('test') } catch { useMemoryOnly = true }`).
- **Fotos NUNCA em localStorage.** Upload direto para Uploadthing/Supabase no Passo 6 → persistir apenas **URL** (ou `fileKey`) no localStorage.
- **Servidor-side draft** opcional quando logado: `Customization { draft: Boolean, orderId: null }` — persiste no Postgres a cada passo (debounced 2s) para usuários autenticados.
- **Analytics por passo**: evento `wizard_step_completed` + `wizard_step_abandoned` com timestamp → identifica onde os usuários pulam.
- **Validação inline** (react-hook-form + zod) antes de permitir "Próximo" — bloqueia progresso com erro claro em vez de deixar avançar e quebrar no final.
- **Barra de progresso visível + "Você pode voltar a qualquer momento"** reduz ansiedade.
- **Mobile-first 375px** — testar em iPhone SE real, não só DevTools.
- **Testar em Safari privado + Firefox privado** no QA — modos estritos viram padrão em 2026.
- **Versionar schema do localStorage** (`wizard_v2`) — quando mudar campos, não crashar por estado antigo.

**Warning signs:**
- Conversão do wizard < 30% (padrão e-commerce BR customizado é 40-55%).
- Sentry mostrando `QuotaExceededError` ou `SecurityError` em localStorage.
- Usuários relatando "sumiu o que eu preenchi" em suporte.
- Analytics: drop-off massivo no Passo 6 (upload) — é onde a quota estoura.

**Phase to address:** Fase 3 (Wizard). Analytics de passo obrigatório desde o MVP.

---

### Pitfall 6: Cache de preço de frete Melhor Envio desatualizado

**What goes wrong:**
Dev cacheia o retorno da API Melhor Envio por 24h no Redis/memória para economizar latência/chamadas. Cliente vê "Frete PAC: R$ 18,90" no carrinho. No checkout (5 minutos depois), a preferência MP é criada com esse valor antigo. Melhor Envio reajustou tabela (Correios reajusta PAC/SEDEX várias vezes por ano). A loja paga R$ 24,90 pelo envio, absorvendo o delta. Em volume, prejuízo real.

Outra variante: token OAuth Melhor Envio **expira em 30 dias**. Ninguém renova. Frete começa a retornar erro 401 na sexta-feira à noite e o checkout fica quebrado o fim de semana inteiro.

**Why it happens:**
1. "Otimização prematura" de latência sem discussão de staleness.
2. Token expiration silencioso — sem monitor, só descobre quando cliente reclama.
3. Sandbox do Melhor Envio só suporta Correios/Jadlog e transações são auto-aprovadas em 5min — dev testa fluxo feliz e esquece de plugar refresh token em produção.
4. Erro na API de frete não tem fallback — dev assume "sempre vai ter retorno".

**How to avoid:**
- **Cache curto** (max 1 hora) por `(cepOrigem, cepDestino, pesoTotal)`. Ou cache por 15min para segurança.
- **Recalcular frete no checkout** imediatamente antes de criar preference MP (fresh fetch). Nunca depender do valor do carrinho para cobrar.
- **Refresh token automático** + cron diário checando expiração (`/me` endpoint). Alertar 7 dias antes de expirar.
- **Health check** semanal enviando CEP fixo + pacote fixo e comparando com valor esperado (drift > 15% = alerta).
- **Fallback de frete**: se Melhor Envio falhar, exibir tabela flat hardcoded ("PAC R$ 19,90 / SEDEX R$ 29,90 — frete preciso calculado após confirmação") + marcar pedido `shippingToBeConfirmed`.
- **Logar sempre**: `{from, to, weight, cost, carrier, serviceId, tokenUsed}` para auditoria.
- **Separar credenciais** sandbox vs prod claramente no `.env` (`MELHOR_ENVIO_TOKEN_PROD` vs `_SANDBOX`) e errar alto se trocadas.

**Warning signs:**
- Contas de envio não batendo com frete cobrado (olhar margem no admin).
- Erros 401 recorrentes no Sentry no endpoint de frete.
- Cliente diz "fiz o pedido sábado e até segunda ninguém confirmou" — sinal de que checkout travou.
- Cache hit rate > 90% — suspeito demais, mostra que cache está vencido.

**Phase to address:** Fase 4 (Checkout + Frete). **Monitor de token expiration obrigatório antes de go-live.**

---

### Pitfall 7: Marca d'água removível e download do original exposto

**What goes wrong:**
O site aplica marca d'água com Sharp server-side. Parece seguro. Mas:
- `next/image` otimiza a imagem e **preserva o original** em `/_next/image?url=/watermarked.jpg&w=...` — se a marca d'água é tile pequeno, AI de inpainting (Remini/Photoshop AI) remove em 3 cliques.
- Admin tem botão "Download foto original" — se o link for acessível sem auth check adequado, expõe a foto sem marca d'água.
- No flipbook 3D, páginas são imagens `<Image>` — basta F12 → salvar como → imagem sem proteção real.
- Preview no wizard mostra foto enviada sem marca d'água (dev "achou que era só interno").

**Why it happens:**
1. Confiança de que marca d'água opaca e diagonal é suficiente — em 2026 AI inpainting tira fácil.
2. Cliente (o estúdio) pediu "marca d'água" e dev implementa literalmente — sem pensar no threat model real.
3. Proteção client-side (disable right-click, `user-select: none`) dá falsa sensação de segurança.
4. Mesma URL serve arte pública E arte privada — não há separação de camadas.

**How to avoid:**
- **Marca d'água robusta**: tile repetido + opacidade ~40% + texto em 2 camadas (sobre e sob o objeto) + rotação aleatória por imagem. Dificulta inpainting em massa.
- **Duas versões físicas** no storage: `/private/{orderId}/original.jpg` (bucket privado, só admin com role check) e `/public/{orderId}/watermarked.jpg` (bucket com CDN). Nunca o original vai para URL servida publicamente.
- **Pre-pagamento**: qualquer preview da arte para o cliente (antes de pagar o livro) é **obrigatoriamente marca-d'aguada e em baixa resolução** (max 800px lado maior).
- **Pós-pagamento**: cliente NÃO precisa baixar a arte digital — ele recebe o livro físico. Não expor PDFs/artes high-res na área do cliente.
- **Admin download**: endpoint `/api/admin/foto/:id` com verificação de role ADMIN + log de acesso (quem/quando baixou). Signed URL de 5min.
- **Marca d'água forensic** (opcional, v2): embutir ID do cliente/pedido no bitmap (LSB) — se vazar, rastreia a fonte.
- Aceitar que **determined attackers will win** — proteção é para uso casual; focar em processo (contrato + ToS) + marca d'água visível + low-res previews.

**Warning signs:**
- Foto de exemplo da galeria achada no Pinterest sem marca d'água.
- Admin com link direto `/storage/originals/...` compartilhável via copy-paste.
- Wizard mostrando foto enviada em full res no preview lateral.

**Phase to address:** Fase 3 (Upload + Marca d'água) + Fase 5 (Admin).

---

### Pitfall 8: Next.js 14 Server Actions sem authorization = escalação de privilégio

**What goes wrong:**
Server Action é tratada como "função privada porque está no servidor". Mas Server Actions são **endpoints POST públicos** — qualquer um conhecendo o action ID pode chamar. Developer cria `updateOrderStatus(orderId, newStatus)` como Server Action para o admin; esquece de validar `session.user.role === 'ADMIN'`. Cliente normal consegue mover o próprio pedido para `ENTREGUE` ou cancelar pedido de outro usuário.

**Why it happens:**
1. Intuição falsa: "está atrás de `'use server'`, então é seguro."
2. Next.js 14 docs mostram exemplos simples que pulam auth para brevidade.
3. Fluxos mistos (mesma action chamada no admin e no cliente) ficam com auth frouxa.
4. Revalidação incorreta — `revalidatePath` em action de mutação cruza escopo (admin invalida cache do cliente e vice-versa).

**How to avoid:**
- **Toda Server Action começa com `const session = await auth()` + check explícito** de auth + authorization. Padrão único:
  ```ts
  'use server'
  export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const session = await auth()
    if (!session?.user) throw new Error('UNAUTHENTICATED')
    if (session.user.role !== 'ADMIN') throw new Error('FORBIDDEN')
    // validar input com zod
    // validar ownership se aplicável
  }
  ```
- **Validação de input com Zod** sempre — cliente pode enviar qualquer coisa (`orderId` aleatório, status inválido).
- **Ownership check** quando mesmo endpoint serve cliente e admin: cliente só pode tocar em `order.userId === session.user.id`.
- **Action IDs estáveis mudam por build** — isso protege contra chamadas antigas, mas **não é authorization**. Não confiar nisso.
- **Pattern: "dal/" layer** — criar `lib/dal/orders.ts` que recebe `session` explicitamente e faz check dentro, evitando esquecer em nova action.
- **Rate limit** em Server Actions expostas a guest (criar pedido, buscar frete) — `upstash/ratelimit` ou middleware.
- **Revalidar com precisão**: `revalidateTag('order-' + orderId)` em vez de `revalidatePath('/')` (invalida demais).

**Warning signs:**
- Grep `'use server'` e ver ações sem `auth()` no topo.
- Admin lista de pedidos lenta → revalidatePath global.
- Sentry: action falhando com "FORBIDDEN" — sinal de tentativa real ou QA descobrindo brecha.

**Phase to address:** Fase 1 (setup) — criar helper `requireAdmin()` / `requireAuth()` antes de qualquer Server Action ser escrita. Revisar em Fase 4 e 5.

---

### Pitfall 9: Validação só no cliente (Zod no front) — preço manipulado no checkout

**What goes wrong:**
Wizard e carrinho calculam desconto de R$ 20 por adicional no frontend (Zustand). Cliente abre DevTools, muda `price` no store para R$ 1,00, vai ao checkout. Server Action cria Preference MP com `unit_price: 1.00`. Cliente paga R$ 5 por livro de R$ 249,90. Mercado Pago aprova. Loja só descobre semanas depois.

**Why it happens:**
1. Zustand/context guarda o carrinho inteiro com preços — passa direto para Server Action.
2. Validação com Zod no cliente dá sensação de segurança ("Zod bloqueou").
3. Desconto combo calculado client-side é copiado server-side sem recalcular.
4. Falta de teste adversarial — dev só testa "happy path".

**How to avoid:**
- **No servidor:** cliente manda APENAS `productId[]` e `quantity[]`. Preço SEMPRE é buscado do Postgres (`Product.price`).
- **Desconto combo** calculado server-side em função pura `calculateCart(items: {productId, qty}[])` — nunca trustar valor do client.
- **Stock/availability check** server-side antes de criar preference (produto pode ter sido desativado).
- **Comparar total client vs server** — se bateu divergência, logar como "tampering attempt" no Sentry.
- **Preference MP recebe valores vindos do banco**, não do request body.
- **Test adversarial no QA**: rodar script que manipula payload e confirma que servidor rejeita.

**Warning signs:**
- Pedidos com total suspeito (R$ 50 quando menor livro é R$ 249,90).
- Mercado Pago relatório com valores divergentes do esperado.
- Cliente comprando livro + adicional com total < R$ 249,90.

**Phase to address:** Fase 4 (Checkout) — bloqueante.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Usar Supabase Free em produção | R$ 0 no MVP | Projeto pausa após 7 dias inatividade; 500MB DB + 1GB storage estouram com ~50 pedidos reais com fotos | **Nunca em produção.** OK durante dev. Migrar para Pro ($25/mês) antes de lançar. |
| localStorage como única fonte do wizard | Simples, sem backend | Perde-se em Safari privado, em purge, em troca de device | OK no MVP; adicionar draft server-side na v2 |
| Evolution API sem plano B | Economia vs WhatsApp Cloud API | Ban = perda de canal de comunicação em produção, sem aviso | OK no MVP com fallback e-mail; nunca como canal único |
| Polling de status de pagamento no frontend a cada 3s | UX imediata, sem depender de webhook | Ddos no próprio MP, bloqueio da conta | Só após pagamento PIX criado, com backoff exponencial (3s → 5s → 10s → 30s) e hard stop em 10min |
| Cachear frete por 24h | Latência menor | Prejuízo em reajuste de tabela | OK para 1h com invalidação no checkout real |
| Marca d'água simples (1 texto centralizado) | 10 linhas de Sharp | AI remove em 2025+ fácil | Aceitável para v1 combinado com low-res; nunca para arte final em high-res |
| Guest checkout sem vincular ao cadastro depois | Menos fricção inicial | Cliente não consegue acompanhar pedido; suporte vira caos | Sempre oferecer "criar conta" após confirmar pedido, pré-preenchido |
| Enviar e-mail direto sem fila | Simples | Um SMTP down derruba fluxo de pagamento | OK no MVP se Resend estável; enfileirar (Inngest/Trigger.dev/QStash) na v2 |
| Usar `any` em handlers do MP webhook | Passa TypeScript rápido | Bug de dado ausente/renomeado vira produção | Nunca. Sempre tipar payload ou usar SDK oficial |
| `revalidatePath('/')` em toda mutação | Garante cache fresh | Invalida tudo, performance cai | Nunca em prod; usar `revalidateTag` específico |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Mercado Pago webhook** | Confiar no body.data.status | Sempre re-buscar via `payment.get(id)` + validar `x-signature` |
| **Mercado Pago PIX** | Assumir pagamento via redirect `back_urls.success` | `back_urls` é UX apenas — status real vem do webhook (PIX pode aprovar em segundos, mas boleto demora dias) |
| **Mercado Pago Checkout Pro** | Pagador sem `email` válido → preference rejeitada silenciosamente | Validar email Zod antes de criar preference; guest precisa de e-mail |
| **Mercado Pago refund** | Implementar só o happy path | Reembolso parcial, chargeback, cancelamento pós-envio — fluxos distintos; documentar responsabilidade |
| **Melhor Envio** | Token "bearer" confundido com API key fixa | É OAuth2 refreshable, expira em 30 dias, precisa refresh |
| **Melhor Envio sandbox** | Testar pagamento no sandbox | Sandbox só suporta simulação de Correios/Jadlog com Yapay; não integra com MP sandbox |
| **Melhor Envio pricing** | Informar dimensões erradas do livro | Livro capa dura 20 págs pesa 0.7-0.9kg e dimensões 22×32×3cm — medir **antes** para não ter delta em produção |
| **Uploadthing** | Definir maxFileSize muito alto | Foto de iPhone 10-15MB é comum; definir 16MB e comprimir client-side antes |
| **Uploadthing free tier** | Assumir quota "suficiente" | Documentação é opaca; monitor e plano de migração para R2/Supabase Storage se atingir rate limit |
| **Supabase Storage** | Bucket público para "só URLs obscuras" | RLS + signed URLs com TTL curto obrigatório para fotos de crianças |
| **Supabase Free** | Pausa em 7 dias inatividade | Heartbeat cron OU upgrade para Pro antes de lançar |
| **Resend** | Enviar sem configurar DKIM+SPF+DMARC do domínio | E-mails vão para spam massivamente no BR (Gmail/Hotmail são rígidos); verificar domínio antes de 1º envio |
| **Resend free tier** | 3.000 e-mails/mês, 100/dia | E-commerce real com 5 transacionais por pedido estoura rápido — monitor + upgrade |
| **NextAuth Credentials + Prisma Adapter** | Session strategy default (database) | Credentials exige `session: { strategy: 'jwt' }`; senão Session callback nunca dispara |
| **NextAuth Edge Middleware** | Importar Prisma no middleware | Prisma não roda em Edge; usar auth.js v5 com split config (auth.config.ts sem adapter) |
| **Vercel Cron Hobby** | Assumir execução exata | Pode rodar em qualquer momento da hora; só 2 crons, 1x/dia |
| **Vercel Cron** | Sem CRON_SECRET | URL pública `/api/cron/cleanup` pode ser chamada por qualquer um — proteger header |
| **Evolution API** | Template de mensagem fixo | Variar texto, randomizar delays, limitar volume — senão ban |
| **Evolution API** | Usar número principal da empresa | Chip dedicado descartável |
| **ViaCEP** | Assumir 100% uptime | Cair para BrasilAPI ou `cep-promise` com fallback multi-provider |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Sharp síncrono no webhook MP | Webhook demora > 22s, MP retry cascade, pedidos duplicados | Enfileirar watermark; webhook apenas marca `paidAt` | A partir do 1º pedido real com 4 fotos |
| `next/image` sem `sizes` em galeria masonry | LCP > 4s no mobile, CLS ruim | `sizes="(max-width: 768px) 100vw, 33vw"` explícito | Tráfego mobile real, especialmente 3G |
| Home carregando flipbook (`react-pageflip`) no SSR | Hydration mismatch, bundle +80KB gz | Dynamic import `{ssr:false}` + skeleton; considerar não auto-start | Lighthouse mobile desde início |
| Lista de pedidos admin sem paginação | Admin trava depois de 500 pedidos | Paginação + cursor (`createdAt + id`); lazy load | ~6 meses operando |
| Produto/customização carregando tudo em 1 query `include` profundo | Queries N+1 disfarçadas no Prisma | `select` explícito; carregar relações sob demanda | Carrinho com 3+ items |
| Flipbook de 20 páginas com imagens full-res | 20×300KB = 6MB na primeira renderização | Converter para AVIF/WebP; gerar thumbnails via `next/image`; preload só 2 primeiras páginas | Em qualquer mobile 3G/4G fraco |
| Supabase free tier em e-commerce real | 500 DAU × 50KB/req × 20 reqs = 500MB/dia → esgota bandwidth em 4 dias | Upgrade Pro antes de tráfego; CDN cache agressivo | No 1º pico de tráfego |
| Server Components buscando dados em série | TTFB alto (> 2s) | `Promise.all` + `unstable_cache`/`revalidateTag` | Páginas com 3+ data sources |
| Ausência de DB indexes em `Order.userId`, `Order.paymentId`, `Order.status` | Admin list lento após poucos meses | Adicionar indexes na migration inicial | ~1000 pedidos |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Bucket público de fotos de criança | Violação LGPD + dano reputacional (produto infantil) | Bucket privado + RLS + signed URLs TTL curto |
| Não validar HMAC do webhook MP | Marcar pedidos como pagos sem pagamento | Validação obrigatória antes de processar |
| Server Action sem authorization | Escalação: cliente altera status de pedido de outro | `requireAdmin()` / `requireAuth()` em toda action |
| Preço do carrinho vindo do client | Manipulação de preço via DevTools | Server recalcula a partir de `productId` + `quantity` |
| Admin panel sem middleware de role | `/admin/*` acessível por qualquer logado | `middleware.ts` com redirect + `role === 'ADMIN'` |
| Guest order sem verificação de e-mail | Qualquer um faz pedido em nome de terceiros → reclamação/estorno | E-mail de confirmação com link; bloquear domains suspeitos |
| Log de dados pessoais em Sentry | Vazamento LGPD em breach | Scrub PII no `beforeSend` do Sentry (e-mail, CPF, telefone, URLs de fotos) |
| Paypal/MP credentials em `NEXT_PUBLIC_*` | Access token exposto no bundle | Nunca prefixar `NEXT_PUBLIC_` em segredos; só public key do MP Brick |
| Diretório `/admin` indexado por Google | SEO expõe estrutura; bots tentam login | `robots.txt Disallow: /admin` + `noindex` meta |
| Link de rastreamento previsível (`/pedido/1`, `/pedido/2`) | Enumeration — ver pedidos alheios | Usar `cuid()` (já no schema) + auth check em `getOrder(id)` |
| Upload sem validação de MIME/size server-side | Arbitrary file upload (PHP, SVG com script) | Whitelist MIME no servidor; Sharp re-encode força JPEG/PNG |
| Sem rate limit no wizard/upload | Ataque enche storage com fotos aleatórias | Rate limit por IP + captcha leve (hCaptcha/Turnstile) no upload |
| Dedicatória renderizada sem sanitização | XSS via campo livre | Armazenar raw, renderizar como text (React já escapa); sanitizar se for PDF/HTML |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Wizard sem preview do "livro sendo montado" | Adulto não vê valor, abandona | Preview lateral persistente com capa + nome da criança crescendo a cada passo |
| Foto "dica" só em texto ("boa iluminação") | Cliente manda foto ruim; equipe rejeita depois = fricção | 3 exemplos visuais "sim/não" no Passo 6 + validador client-side (resolução mínima 800px) |
| Validação aparece só ao clicar "Próximo" | Frustração; volta e descobre 3 erros | Validação inline onBlur (react-hook-form + zod) |
| Status "Em produção" genérico por 10 dias | Cliente ansioso liga várias vezes no WhatsApp | Sub-status: "Aguardando arte" → "Arte aprovada" → "Impressão" → "Acabamento" + ETA real |
| Checkout pedindo login antes de ver frete | Cliente desiste antes de ver custo total | Calcular frete no carrinho (só CEP); login só na última etapa; guest sempre permitido |
| CEP manual sem autopreenchimento | Erros de digitação, endereço errado, produto perdido | ViaCEP/BrasilAPI onBlur com fallback + campo editável |
| Erro de pagamento = tela genérica "Erro" | Cliente não sabe se foi cobrado | Tela específica: "Pagamento não aprovado — seu cartão não foi cobrado. Tente outro método." + link suporte |
| PIX exibindo apenas QR sem copia-e-cola | Desktop sem celular para escanear | Sempre mostrar QR + botão "Copiar código PIX" |
| Timeline de pedido sem data estimada de entrega | Cliente pergunta no WhatsApp toda semana | Calcular ETA realista (produção + Melhor Envio) + mostrar "chega entre DD e DD" |
| Imagem do produto "infantilizada" demais | Adulto comprador se afasta (não é o público) | Paleta quente, fotografia premium, tipografia serif; criança aparece no produto, não no site |
| Galeria sem filtro por tema/idade | Navegação confusa | Filtros persistentes na URL (`?tema=dinossauros&idade=4-6`) |
| FAQ curto demais (5 perguntas) | Cliente busca e-mail/WhatsApp para dúvidas básicas | Mínimo 12-15 perguntas: prazo, trocas, devolução, pagamento recusado, LGPD, direitos autorais |
| Política de privacidade genérica boilerplate | Desconfiança de compra; risco LGPD | Política customizada mencionando explicitamente fotos de crianças, retenção, DPO |
| Email transacional sem branding | Vai para spam; cliente não reconhece | React Email com header colorido, logo, tracking de abertura via Resend |

---

## "Looks Done But Isn't" Checklist

Coisas que parecem completas mas estão faltando peça crítica.

- [ ] **Webhook Mercado Pago:** Verificar que (a) valida `x-signature`, (b) re-busca payment via API, (c) é idempotente (constraint UNIQUE em paymentId), (d) responde 200 em < 22s, (e) tem fallback de polling (`/api/cron/reconcile-payments` diário).
- [ ] **Upload de fotos:** Verificar que (a) bucket é privado (teste em aba anônima), (b) URLs são signed com TTL, (c) consentimento LGPD registrado com IP+timestamp, (d) existe job de retenção 90 dias, (e) endpoint de deleção por cliente funciona.
- [ ] **Marca d'água:** Verificar que (a) aplicada em TODAS previews (site + admin + e-mail + WhatsApp), (b) imagem original NUNCA servida por URL pública, (c) resolução de preview pré-pagamento é baixa (≤800px), (d) admin download tem log de auditoria.
- [ ] **Checkout:** Verificar que (a) preços server-side (Zod não impede manipulação), (b) frete recalculado no commit final, (c) total servidor === total enviado ao MP, (d) duplicação de pedido prevenida (sessionId/idempotencyKey).
- [ ] **WhatsApp Evolution:** Verificar que (a) fallback e-mail existe, (b) chip é dedicado (não pessoal), (c) rate limit + variação de mensagem implementados, (d) monitor de connectionState alerta ban, (e) lib é trocável (interface abstrata para migrar para WhatsApp Cloud).
- [ ] **Wizard:** Verificar que (a) fotos NÃO vão para localStorage (só fileKey), (b) funciona em Safari privado, (c) validação inline onBlur, (d) analytics de abandono por passo, (e) consentimento LGPD é checkbox explícito.
- [ ] **Server Actions:** Verificar que (a) toda action começa com `auth()` + role check, (b) ownership verificado quando cliente toca em dado próprio, (c) Zod valida input, (d) rate limit em actions abertas a guest.
- [ ] **E-mail:** Verificar que (a) DKIM+SPF+DMARC do domínio estão setados e passam em mail-tester.com, (b) remetente é `@dominio.com.br` validado no Resend, (c) link de unsubscribe se for marketing, (d) templates testados em Gmail+Hotmail+Outlook.
- [ ] **LGPD:** Verificar que (a) política de privacidade publicada e linkada no rodapé+wizard+checkout, (b) DPO identificado, (c) registro de operações (relatório de impacto LGPD básico), (d) termos específicos para fotos de crianças.
- [ ] **SEO:** Verificar que (a) `schema.org/Product` em todas fichas, (b) `sitemap.xml` gerado dinamicamente incluindo páginas de produto, (c) `robots.txt` bloqueia `/admin`, `/cliente`, `/checkout`, `/api/`, (d) metadata OG com imagem por rota, (e) `lang="pt-BR"` no HTML.
- [ ] **Performance:** Verificar que (a) Lighthouse mobile ≥ 80 na home, (b) LCP < 2.5s no 4G throttled, (c) imagens em AVIF/WebP via `next/image`, (d) sem "Large Layout Shift" no flipbook.
- [ ] **Admin:** Verificar que (a) middleware valida role em `/admin/*`, (b) não indexável por Google, (c) histórico de mudanças de status persistido (audit log), (d) export CSV não trava em grandes volumes.
- [ ] **Sentry:** Verificar que (a) está configurado em client+server, (b) `beforeSend` remove PII (e-mail, CPF, URLs de fotos), (c) source maps upload no CI, (d) alertas (Slack/email) para erros críticos (webhook, payment).
- [ ] **Cron Jobs Vercel:** Verificar que (a) protegidos com `CRON_SECRET` header, (b) idempotentes (Vercel pode executar 2x), (c) observabilidade (log de sucesso/falha), (d) mantidos em Hobby dentro do limite 2×/dia.
- [ ] **Rate limits:** Verificar que (a) wizard upload tem limite por IP, (b) login tem limite por e-mail (brute force), (c) APIs públicas (`/api/frete`, `/api/produtos`) protegidas.
- [ ] **Testes adversariais:** Verificar que (a) manipular preço no DevTools é bloqueado server-side, (b) acessar `/admin` como cliente não-admin redireciona, (c) chamar Server Action fora do UI é rejeitado sem auth, (d) webhook forjado sem assinatura é rejeitado 401.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Webhook MP processou pedido em duplicata | MEDIUM | (1) Identificar via query `paymentId duplicado`; (2) marcar extras como `CANCELADO_DUPLICATA`; (3) comunicar cliente; (4) deploy fix com `UNIQUE` + re-buscar; (5) backfill status real via API polling |
| Ban Evolution API em produção | HIGH | (1) Comunicar clientes afetados por e-mail; (2) ativar fallback e-mail; (3) comprar chip novo + warmup 2 semanas; (4) acelerar migração para WhatsApp Cloud API oficial |
| Bucket de fotos público descoberto | CRITICAL | (1) Tornar privado IMEDIATAMENTE; (2) rotacionar URLs (regenerar); (3) notificar ANPD se houve exposição real (prazo 72h); (4) notificar titulares (responsáveis) nos termos LGPD; (5) auditoria completa; (6) incident report público (transparência) |
| Supabase free tier pausou produção | LOW | (1) Upgrade Pro imediato ($25); (2) restaurar; (3) configurar monitoring de usage antecipado |
| Preço manipulado descoberto | MEDIUM | (1) Cancelar pedido específico + estornar; (2) fix server-side price calculation; (3) auditar últimos 30 dias; (4) adicionar monitor de valor mínimo por pedido |
| Frete Melhor Envio desatualizado (prejuízo) | LOW-MEDIUM | (1) Calcular delta acumulado; (2) ajustar preços ou absorver; (3) reduzir TTL de cache; (4) adicionar health check semanal |
| Token Melhor Envio expirou no fim de semana | MEDIUM | (1) Renovar OAuth manualmente; (2) comunicar clientes; (3) implementar refresh automático + alerta pré-expiração; (4) considerar fallback tabela flat |
| OOM Sharp em pico | MEDIUM | (1) Aumentar memória função; (2) redimensionar antes de watermark; (3) enfileirar; (4) migrar para serviço dedicado se recorrente |
| Wizard perde dados de usuários | MEDIUM | (1) Analytics para dimensionar impacto; (2) hotfix com try/catch + server-side draft; (3) e-mail proativo "notamos que ficou um pedido incompleto — terminamos aqui?" |
| Cliente LGPD pede deleção e dados não encontrados | HIGH | (1) Auditar storage manualmente; (2) responder em 15 dias (prazo ANPD); (3) implementar endpoint de deleção; (4) docs atualizados |

---

## Pitfall-to-Phase Mapping

Como as fases do roadmap devem prevenir cada armadilha.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. MP webhook sem idempotência/HMAC | **Fase 4** (Checkout + Pagamento) | Teste: enviar mesmo webhook 3x → 1 pedido; enviar sem `x-signature` → 401 |
| 2. LGPD retenção / bucket público | **Fase 3** (Upload) + Fase 1 (setup RLS) | Teste: URL de foto em aba anônima → 403; rodar job de retenção → apaga >90 dias |
| 3. Evolution API ban | **Fase 5** (Comunicação) — com interface abstrata desde **Fase 1** | Teste: desligar Evolution → sistema cai para e-mail sem erro |
| 4. Sharp OOM/timeout | **Fase 3** (Marca d'água) | Benchmark: 4 fotos 12MP × 10 execuções concorrentes → sem OOM em 1769MB |
| 5. Wizard perde dados mobile | **Fase 3** (Wizard) | Teste: Safari privado + fotos 4× → estado preservado; analytics mostra <10% abandono por passo |
| 6. Cache frete desatualizado | **Fase 4** (Checkout) | Monitor: delta frete cobrado vs pago < 5%; refresh token falha → alert |
| 7. Marca d'água bypass | **Fase 3** (Upload) + **Fase 5** (Admin) | Teste: URL de original em aba anônima → 403; preview é low-res; AI inpainting não limpa em teste manual |
| 8. Server Actions sem auth | **Fase 1** (setup) + auditoria em **Fase 4, 5** | Grep `'use server'` + manual review; Playwright test chama action sem auth → rejeita |
| 9. Validação só client-side de preço | **Fase 4** (Checkout) | Teste: manipular preço em DevTools → 400 no servidor; total divergente logado em Sentry |
| Supabase free limits | **Fase 6** (Deploy) — antes de lançar | Upgrade Pro; monitor de usage em dashboard |
| Next.js Server Actions revalidação | **Fase 1** setup + Fases 4-5 | Code review: toda action usa `revalidateTag` específica |
| DKIM/SPF/DMARC do Resend | **Fase 5** (Comunicação) | `mail-tester.com` ≥ 9/10 antes do 1º e-mail real |
| SEO pt-BR | **Fase 6** (Deploy) | Lighthouse SEO ≥ 95; schema validator passa |
| Vercel cron idempotência | **Fase 5** (background jobs) | Executar cron 2x manualmente → sem side effects duplicados |

---

## Sources

### Mercado Pago
- [Webhooks - Notificações - Mercado Pago Developers (pt-BR)](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Mercado Pago Node.js SDK (GitHub)](https://github.com/mercadopago/sdk-nodejs)
- [Signature Validation with x-signature (Discussion)](https://github.com/mercadopago/sdk-nodejs/discussions/318)
- [Webhook: receba notificações de pagamento em tempo real](https://www.mercadopago.com.br/blog/webhooks-notificacoes-pagamento-tempo-real)

### Webhook Idempotency
- [Node.js Webhooks: Idempotency Patterns That Save You (Medium, Jan 2026)](https://medium.com/@Quaxel/node-js-webhooks-idempotency-patterns-that-save-you-769ae4bb4ebc)
- [Building a Robust Webhook Handler in Node.js (Ozigi Blog)](https://blog.ozigi.app/blog/robust-webhook-handler-in-nodejs)
- [Webhooks Fundamentals 2026 (Hooklistener)](https://www.hooklistener.com/learn/webhooks-fundamentals)

### LGPD e Dados de Crianças
- [ANPD divulga enunciado sobre tratamento de dados de crianças e adolescentes](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes)
- [LGPD Brasil - Artigo 14 (dados de crianças)](https://lgpd-brasil.info/capitulo_02/artigo_14)
- [LGPD e fotografias não autorizadas (FGV)](https://portal.fgv.br/artigos/lgpd-e-fotografias-nao-autorizadas-falta-de-compliance-ou-falta-de-fiscalizacao)
- [Serpro - O que crianças ganham com LGPD](https://www.serpro.gov.br/lgpd/noticias/criancas-adolescentes-lgpd-lei-geral-protecao-de-dados-pessoais)
- [Governo Federal - Tomada de Subsídios ANPD (2025)](https://www.gov.br/participamaisbrasil/tscriancaeadolescente)

### Evolution API / WhatsApp Ban Risk
- [Evolution API Problems in 2025 (WasenderAPI)](https://wasenderapi.com/blog/evolution-api-problems-2025-issues-errors-best-alternative-wasenderapi)
- [WhatsApp Automation Ban Risk (Kraya-ai)](https://blog.kraya-ai.com/whatsapp-automation-ban-risk)
- [Baileys - High number of bans Issue](https://github.com/WhiskeySockets/Baileys/issues/1869)
- [Evolution API: Revolutionary WhatsApp Integration (BrightCoding, Feb 2026)](http://www.blog.brightcoding.dev/2026/02/17/evolution-api-the-revolutionary-whatsapp-integration-platform)

### Sharp + Vercel
- [Vercel Functions Limits (oficial)](https://vercel.com/docs/functions/limitations)
- [Troubleshooting 250MB limit](https://vercel.com/kb/guide/troubleshooting-function-250mb-limit)
- [Configuring Memory and CPU for Vercel Functions](https://vercel.com/docs/functions/configuring-functions/memory)
- [Vercel Serverless Function Timeout 2026](https://codegive.com/blog/vercel_serverless_function_timeout.php)

### Next.js 14 Server Actions Security
- [How to Think About Security in Next.js (oficial)](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [Guides: Data Security (Next.js oficial)](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Server Actions Security: 5 Vulnerabilities (Makerkit)](https://makerkit.dev/blog/tutorials/secure-nextjs-server-actions)
- [Next.js Security Update Dec 2025](https://nextjs.org/blog/security-update-2025-12-11)
- [Next.js Security Best Practices 2026 (Authgear)](https://www.authgear.com/post/nextjs-security-best-practices)

### Supabase
- [Storage Access Control (RLS)](https://supabase.com/docs/guides/storage/security/access-control)
- [Create Signed URL (JavaScript)](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl)
- [Supabase Pricing 2026 (UI Bakery)](https://uibakery.io/blog/supabase-pricing)
- [Supabase Free Tier Actual Limits (Cotera)](https://cotera.co/articles/supabase-pricing-guide)
- [Bandwidth & Storage Egress](https://supabase.com/docs/guides/storage/serving/bandwidth)

### Melhor Envio
- [Melhor Envio - Introdução API](https://docs.melhorenvio.com.br/reference/introducao-api-melhor-envio)
- [Sandbox Melhor Envio](https://docs.melhorenvio.com.br/docs/sandbox)
- [Token OAuth - Expiração 30 dias](https://docs.melhorenvio.com.br/reference/solicitacao-do-token)

### NextAuth / Auth.js
- [Prisma Adapter (Auth.js)](https://authjs.dev/getting-started/adapters/prisma)
- [Credentials + Prisma Adapter Session Issue](https://github.com/nextauthjs/next-auth/issues/6828)
- [NextJS Session Management 2025 (Clerk)](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues)

### Vercel Cron
- [Vercel Cron Jobs (oficial)](https://vercel.com/docs/cron-jobs)
- [How to Secure Vercel Cron Routes in Next.js 14](https://codingcat.dev/post/how-to-secure-vercel-cron-job-routes-in-next-js-14-app-router)
- [Monitoring Vercel Cron Jobs (CronCrew)](https://croncrew.io/blog/15-vercel-cron-monitoring)

### Resend / Deliverability
- [Implementing DMARC (Resend oficial)](https://resend.com/docs/dashboard/domains/dmarc)
- [Email Deliverability for SaaS: SPF/DKIM/DMARC Setup](https://dev.to/whoffagents/email-deliverability-for-saas-spf-dkim-dmarc-setup-and-resend-integration-1hpd)

### CEP lookup
- [BrasilAPI cep-promise (GitHub)](https://github.com/BrasilAPI/cep-promise)
- [Benchmark BrasilAPI vs ViaCEP (TabNews)](https://www.tabnews.com.br/fabiobrasileiro/fiz-um-pequeno-benchmark-entre-brasilapi-e-viacep-diretamente)

### Wizard UX
- [Creating An Effective Multistep Form (Smashing Magazine)](https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/)
- [Wizard UI Pattern Explained (Eleken)](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained)
- [Solving the Wizard Problem (Chris Zempel)](https://chriszempel.com/posts/thewizardproblem/)

### Image Protection
- [Techniques for Fighting Image Theft (CSS-Tricks)](https://css-tricks.com/techniques-for-fighting-image-theft/)
- [Keep OTT Content Secure: Resilient Forensic Watermarking (Jscrambler)](https://jscrambler.com/blog/keeping-ott-content-secure-resilient-forensic-watermarking)

---

*Pitfalls research for: E-commerce BR de livros infantis personalizados com fotos de crianças e IA humano-in-the-loop*
*Researched: 2026-04-18*
