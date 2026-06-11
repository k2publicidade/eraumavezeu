import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
  render,
} from "@react-email/components";
import { formatBRL } from "@/lib/format";

// Paleta do selo da marca (tailwind.config.ts) — inline porque e-mail não tem CSS externo
const NAVY = "#1E3A5F";
const GOLD = "#E8C94A";
const CREAM = "#FAF3DC";
const CREAM_LIGHT = "#FFFDF5";
const FOX = "#E8753F";
const FOREST = "#2E5D3C";
const INK = "#1E2A3A";

export type OrderConfirmationProps = {
  buyerName: string;
  orderCode: string;
  items: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
};

export function OrderConfirmationEmail({
  buyerName,
  orderCode,
  items,
  subtotal,
  discount,
  total,
}: OrderConfirmationProps) {
  const firstName = buyerName.trim().split(/\s+/)[0] || "cliente";

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{`Pedido #${orderCode} recebido — em breve falamos com você pelo WhatsApp`}</Preview>
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
          <Text style={{ color: FOREST, fontSize: 13, letterSpacing: 2, margin: 0, textTransform: "uppercase" }}>
            Era Uma Vez Eu
          </Text>
          <Heading as="h1" style={{ color: NAVY, fontSize: 26, margin: "12px 0 0" }}>
            Pedido recebido, {firstName}! 🎉
          </Heading>
          <Text style={{ color: INK, fontSize: 16, lineHeight: "26px", margin: "16px 0 0" }}>
            Seu pedido <strong style={{ color: NAVY }}>#{orderCode}</strong> foi registrado.
            Nossa equipe vai entrar em contato pelo WhatsApp para confirmar as fotos
            da criança e enviar o link de pagamento. Nenhuma cobrança foi feita ainda.
          </Text>

          <Hr style={{ borderColor: GOLD, margin: "24px 0" }} />

          <Heading as="h2" style={{ color: NAVY, fontSize: 18, margin: "0 0 12px" }}>
            Resumo
          </Heading>
          <Section>
            {items.map((item) => (
              <Row key={item.name} style={{ marginBottom: 6 }}>
                <Column>
                  <Text style={{ color: INK, fontSize: 14, margin: 0 }}>
                    {item.quantity}x {item.name}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ color: INK, fontSize: 14, margin: 0 }}>
                    {formatBRL(item.lineTotal)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={{ borderColor: `${GOLD}55`, margin: "16px 0" }} />

          <Section>
            <Row>
              <Column>
                <Text style={{ color: INK, fontSize: 14, margin: 0 }}>Subtotal</Text>
              </Column>
              <Column align="right">
                <Text style={{ color: INK, fontSize: 14, margin: 0 }}>{formatBRL(subtotal)}</Text>
              </Column>
            </Row>
            {discount > 0 && (
              <Row>
                <Column>
                  <Text style={{ color: FOREST, fontSize: 14, margin: 0 }}>Desconto combo</Text>
                </Column>
                <Column align="right">
                  <Text style={{ color: FOREST, fontSize: 14, margin: 0 }}>
                    - {formatBRL(discount)}
                  </Text>
                </Column>
              </Row>
            )}
            <Row>
              <Column>
                <Text style={{ color: NAVY, fontSize: 17, fontWeight: 700, margin: "8px 0 0" }}>
                  Total
                </Text>
              </Column>
              <Column align="right">
                <Text style={{ color: FOX, fontSize: 17, fontWeight: 700, margin: "8px 0 0" }}>
                  {formatBRL(total)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={{ borderColor: GOLD, margin: "24px 0" }} />

          <Text style={{ color: INK, fontSize: 14, lineHeight: "22px", margin: 0 }}>
            <strong style={{ color: NAVY }}>Próximos passos:</strong> confirmamos as fotos,
            enviamos o link de pagamento e iniciamos a produção do livro. Qualquer dúvida,
            é só responder este e-mail.
          </Text>

          <Text style={{ color: `${INK}99`, fontSize: 12, margin: "24px 0 0", textAlign: "center" as const }}>
            Era Uma Vez Eu — livros infantis personalizados
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/** Renderiza assunto + HTML prontos para sendEmail. */
export async function renderOrderConfirmationEmail(
  props: OrderConfirmationProps,
): Promise<{ subject: string; html: string }> {
  return {
    subject: `Pedido #${props.orderCode} recebido — Era Uma Vez Eu`,
    html: await render(<OrderConfirmationEmail {...props} />),
  };
}
