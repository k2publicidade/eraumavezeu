import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
  render,
} from "@react-email/components";
import { type OrderStatusValue, statusLabelOf } from "@/lib/orders/status";

// Paleta da marca
const NAVY = "#1E3A5F";
const GOLD = "#E8C94A";
const CREAM = "#FAF3DC";
const CREAM_LIGHT = "#FFFDF5";
const FOX = "#E8753F";
const FOREST = "#2E5D3C";
const INK = "#1E2A3A";

export type OrderStatusEmailProps = {
  buyerName: string;
  orderCode: string;
  orderId: string;
  toStatus: OrderStatusValue;
  trackingCode?: string | null;
};

export function getStatusDetails(status: OrderStatusValue, trackingCode?: string | null) {
  switch (status) {
    case "PAGAMENTO_CONFIRMADO":
      return {
        heading: "Pagamento Confirmado! 🌟",
        message: "Seu pagamento foi processado com sucesso. Já estamos preparando tudo para começar a produção do livro.",
        badgeColor: FOREST,
        badgeText: "Pronto para começar",
        buttonText: "Ver Detalhes do Pedido",
      };
    case "EM_PRODUCAO":
      return {
        heading: "Seu livro está sendo desenhado! 🎨",
        message: "O livro entrou oficialmente em produção. Nossa equipe está gerando as ilustrações e revisando cada página para que a história fique mágica e perfeita.",
        badgeColor: NAVY,
        badgeText: "Em Produção",
        buttonText: "Acompanhar Produção",
      };
    case "AGUARDANDO_ENVIO":
      return {
        heading: "Produção finalizada! 📦",
        message: "Boas notícias! O livro físico foi impresso, encadernado com capa dura e já está na fila de envio na nossa expedição.",
        badgeColor: GOLD,
        badgeText: "Aguardando Envio",
        buttonText: "Acompanhar Envio",
      };
    case "ENVIADO":
      return {
        heading: "A caminho de novas aventuras! 🚀",
        message: trackingCode
          ? `Seu pedido foi enviado! O código de rastreamento da transportadora é: ${trackingCode}.`
          : "Seu pedido foi enviado! Em breve enviamos o código de rastreio.",
        badgeColor: FOX,
        badgeText: "Enviado",
        buttonText: "Rastrear Entrega",
      };
    case "ENTREGUE":
      return {
        heading: "Entrega concluída! 💛",
        message: "Oba! Seu livro personalizado foi entregue. Esperamos sinceramente que a criança ame essa história única. Muito obrigado por criar com a gente!",
        badgeColor: FOREST,
        badgeText: "Entregue",
        buttonText: "Deixar uma Avaliação",
      };
    case "CANCELADO":
      return {
        heading: "Pedido cancelado ⛔",
        message: "O seu pedido foi cancelado no nosso sistema. Se isso foi um engano ou se você precisar de suporte, basta responder a este e-mail para falar com a nossa equipe.",
        badgeColor: "#8B0000",
        badgeText: "Cancelado",
        buttonText: "Falar com o Suporte",
      };
    default:
      return {
        heading: "Atualização de status",
        message: `Seu pedido foi atualizado para: ${statusLabelOf(status)}.`,
        badgeColor: NAVY,
        badgeText: statusLabelOf(status),
        buttonText: "Acompanhar Pedido",
      };
  }
}

export function OrderStatusEmail({
  buyerName,
  orderCode,
  orderId,
  toStatus,
  trackingCode,
}: OrderStatusEmailProps) {
  const firstName = buyerName.trim().split(/\s+/)[0] || "cliente";
  const label = statusLabelOf(toStatus);
  const details = getStatusDetails(toStatus, trackingCode);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const trackUrl = `${baseUrl}/pedido/${orderId}`;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{`Pedido #${orderCode} atualizado: ${label}`}</Preview>
      <Body style={{ backgroundColor: CREAM, fontFamily: "Georgia, 'Times New Roman', serif", margin: 0 }}>
        <Container
          style={{
            backgroundColor: CREAM_LIGHT,
            border: `1px solid ${GOLD}`,
            borderRadius: 16,
            margin: "32px auto",
            maxWidth: 560,
            padding: "32px 28px",
          }}
        >
          {/* Logo/Marca */}
          <Row>
            <Column>
              <Text style={{ color: FOREST, fontSize: 13, letterSpacing: 2, margin: 0, textTransform: "uppercase" }}>
                Era Uma Vez Eu
              </Text>
            </Column>
            <Column align="right">
              <span
                style={{
                  backgroundColor: details.badgeColor,
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: "bold",
                  padding: "4px 10px",
                  borderRadius: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {details.badgeText}
              </span>
            </Column>
          </Row>

          {/* Heading */}
          <Heading as="h1" style={{ color: NAVY, fontSize: 24, margin: "24px 0 0" }}>
            {details.heading}
          </Heading>

          {/* Intro */}
          <Text style={{ color: INK, fontSize: 16, lineHeight: "26px", margin: "16px 0 0" }}>
            Olá, <strong>{firstName}</strong>,
          </Text>

          {/* Mensagem Principal */}
          <Text style={{ color: INK, fontSize: 16, lineHeight: "26px", margin: "8px 0 24px" }}>
            {details.message}
          </Text>

          {/* Caixa de Destaque com detalhes do Pedido */}
          <Section
            style={{
              backgroundColor: `${CREAM}33`,
              border: `1px solid ${GOLD}66`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Row>
              <Column>
                <Text style={{ color: `${INK}AA`, fontSize: 12, margin: 0, textTransform: "uppercase" }}>
                  Código do Pedido
                </Text>
                <Text style={{ color: NAVY, fontSize: 16, fontWeight: "bold", margin: "4px 0 0" }}>
                  #{orderCode}
                </Text>
              </Column>
              {trackingCode && toStatus === "ENVIADO" && (
                <Column>
                  <Text style={{ color: `${INK}AA`, fontSize: 12, margin: 0, textTransform: "uppercase" }}>
                    Código de Rastreamento
                  </Text>
                  <Text style={{ color: FOX, fontSize: 16, fontWeight: "bold", margin: "4px 0 0" }}>
                    {trackingCode}
                  </Text>
                </Column>
              )}
            </Row>
          </Section>

          {/* Botão de Call to Action */}
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Link
              href={trackUrl}
              style={{
                backgroundColor: toStatus === "CANCELADO" ? "#8B0000" : NAVY,
                borderRadius: 8,
                color: "#FFFFFF",
                display: "inline-block",
                fontSize: 15,
                fontWeight: "bold",
                padding: "12px 24px",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {details.buttonText}
            </Link>
          </Section>

          <Hr style={{ borderColor: GOLD, margin: "24px 0" }} />

          {/* Rodapé explicativo */}
          <Text style={{ color: INK, fontSize: 14, lineHeight: "22px", margin: 0 }}>
            <strong style={{ color: NAVY }}>Acompanhe sua jornada:</strong> você receberá atualizações a cada nova etapa de confecção do livro diretamente no seu e-mail e WhatsApp. Qualquer dúvida ou problema, basta responder a este e-mail.
          </Text>

          <Text style={{ color: `${INK}99`, fontSize: 12, margin: "28px 0 0", textAlign: "center" }}>
            Era Uma Vez Eu — livros infantis personalizados
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/** Renderiza assunto + HTML prontos para sendEmail. */
export async function renderOrderStatusEmail(
  props: OrderStatusEmailProps,
): Promise<{ subject: string; html: string }> {
  const label = statusLabelOf(props.toStatus);
  return {
    subject: `Pedido #${props.orderCode}: ${label} — Era Uma Vez Eu`,
    html: await render(<OrderStatusEmail {...props} />),
  };
}
