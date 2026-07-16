import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";
import { UF_IBGE_CODES } from "@/lib/nfe/nfe-generator";

export const dynamic = "force-dynamic";

export default async function DanfePage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      shippingAddress: true,
    },
  });

  if (!order || order.nfeStatus !== "EMITIDA" || !order.shippingAddress) {
    notFound();
  }

  const addr = order.shippingAddress;
  const key = order.nfeKey || "";
  const formattedKey = key.replace(/(.{4})/g, "$1 ").trim(); // space every 4 digits
  
  const getIssueDate = () => {
    try {
      if (order.nfeIssuedAt) {
        const d = new Date(order.nfeIssuedAt);
        if (!isNaN(d.getTime())) {
          return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date());
  };
  const issueDateStr = getIssueDate();
  const dateMatch = issueDateStr.match(/\d{2}\/\d{2}\/\d{4}/);
  const timeMatch = issueDateStr.match(/\d{2}:\d{2}/);
  const datePart = dateMatch ? dateMatch[0] : issueDateStr.replace(",", "");
  const timePart = timeMatch ? timeMatch[0] : "00:00";

  const totalProducts = order.items.reduce((acc, it) => acc + (it.quantity * Number(it.price)), 0);
  const totalDiscount = Number(order.discount) + Number(order.couponDiscount);

  return (
    <div className="min-h-screen bg-white p-4 font-sans text-dark antialiased md:p-8 select-text">
      {/* Script to trigger print on load if query param ?print=true is present */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.location.search.includes('print=true')) {
              window.addEventListener('load', () => {
                setTimeout(() => {
                  window.print();
                }, 500);
              });
            }
          `,
        }}
      />
      {/* Print Controls (hidden on print) */}
      <div className="mb-6 flex items-center justify-between border-b border-gold/25 pb-4 print:hidden bg-cream-light p-4 rounded-2xl">
        <div>
          <h1 className="text-lg font-serif text-primary">Visualizador de DANFE</h1>
          <p className="text-xs text-dark/60">Esta página está formatada para impressão A4. Pressione Ctrl+P para imprimir.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/envios"
            className="bg-white border border-gold/30 hover:bg-gold/5 text-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
          >
            Voltar à Central
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
          >
            🖨️ Imprimir DANFE
          </button>
        </div>
      </div>

      {/* DANFE Container (Standard A4 dimensions styling) */}
      <div className="mx-auto max-w-[800px] border border-black p-2 text-[10px] uppercase leading-tight bg-white">
        
        {/* 1. CANHOTO (Stub) */}
        <div className="flex border-b border-black pb-2 mb-2">
          <div className="flex-1 pr-2 border-r border-black border-dashed">
            <p>RECEBEMOS DE ERA UMA VEZ EU EDITORA DE LIVROS LTDA OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO</p>
            <div className="mt-2 flex gap-4">
              <div className="border-t border-black pt-1 w-28">
                <span className="text-[7px]">DATA DE RECEBIMENTO</span>
              </div>
              <div className="border-t border-black pt-1 flex-1">
                <span className="text-[7px]">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
              </div>
            </div>
          </div>
          <div className="w-48 pl-2 flex flex-col justify-center text-center">
            <p className="text-xs font-bold">NF-E</p>
            <p className="text-sm font-bold">Nº {order.nfeNumber}</p>
            <p className="text-xs">SÉRIE: {order.nfeSeries}</p>
          </div>
        </div>

        {/* 2. CABEÇALHO / EMITENTE */}
        <div className="grid grid-cols-12 border border-black mb-2">
          {/* Logo & Emitente */}
          <div className="col-span-4 border-r border-black p-1">
            <h2 className="font-bold text-xs">ERA UMA VEZ EU</h2>
            <p className="font-semibold text-[8px]">ERA UMA VEZ EU EDITORA DE LIVROS LTDA</p>
            <p className="text-[8px]">AVENIDA RIO BRANCO, 156 - SALA 2602</p>
            <p className="text-[8px]">CENTRO - RIO DE JANEIRO - RJ</p>
            <p className="text-[8px]">CEP: 20040-003 - FONE: (21) 97512-8634</p>
          </div>

          {/* DANFE Tag */}
          <div className="col-span-3 border-r border-black p-1 text-center flex flex-col justify-center">
            <h3 className="font-bold text-xs leading-none">DANFE</h3>
            <p className="text-[7px] leading-tight">DOCUMENTO AUXILIAR DA<br />NOTA FISCAL ELETRÔNICA</p>
            <div className="mt-1 flex justify-center gap-2 text-left text-[8px]">
              <div>
                <p>0 - ENTRADA</p>
                <p>1 - SAÍDA</p>
              </div>
              <div className="border border-black font-bold px-1.5 flex items-center text-[10px]">1</div>
            </div>
            <p className="mt-1 font-bold text-[8px]">Nº {order.nfeNumber}</p>
            <p className="font-bold text-[8px]">SÉRIE: {order.nfeSeries}</p>
            <p className="text-[7px]">FOLHA 1/1</p>
          </div>

          {/* Key & Barcode */}
          <div className="col-span-5 p-1 flex flex-col justify-between">
            <div>
              <p className="text-[7px] font-semibold">CONTROLE DO FISCO</p>
              {/* Simulated Barcode */}
              <div className="my-1 flex h-6 items-center justify-around bg-black text-white text-[7px] tracking-[0.25em] font-mono leading-none">
                |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
              </div>
            </div>
            <div>
              <p className="text-[7px] font-semibold">CHAVE DE ACESSO</p>
              <p className="font-mono text-[8px] break-all select-all font-semibold leading-normal">{formattedKey}</p>
            </div>
            <div className="border-t border-black/30 pt-1 text-[7px]">
              <p>CONSULTA DE AUTENTICIDADE NO PORTAL NACIONAL DA NF-E EM WWW.NFE.FAZENDA.GOV.BR OU NO SITE DA SEFAZ AUTORIZADORA</p>
            </div>
          </div>
        </div>

        {/* Natureza da Operação */}
        <div className="grid grid-cols-12 border border-black mb-2 divide-x divide-black">
          <div className="col-span-6 p-1">
            <span className="text-[7px] text-dark/60 block">NATUREZA DA OPERAÇÃO</span>
            <span className="font-semibold">VENDA DE MERCADORIA ADQUIRIDA OU RECEBIDA DE TERCEIROS</span>
          </div>
          <div className="col-span-3 p-1">
            <span className="text-[7px] text-dark/60 block">INSCRIÇÃO ESTADUAL</span>
            <span className="font-semibold">149.336.812.110</span>
          </div>
          <div className="col-span-3 p-1">
            <span className="text-[7px] text-dark/60 block">CNPJ DO EMITENTE</span>
            <span className="font-semibold">60.765.718/0001-09</span>
          </div>
        </div>

        {/* 3. DESTINATÁRIO / REMETENTE */}
        <h4 className="font-bold text-[9px] mb-1">DESTINATÁRIO / REMETENTE</h4>
        <div className="border border-black mb-2">
          <div className="grid grid-cols-12 divide-x divide-black border-b border-black">
            <div className="col-span-8 p-1">
              <span className="text-[7px] text-dark/60 block">NOME / RAZÃO SOCIAL</span>
              <span className="font-semibold">{order.guestName || "CONSUMIDOR FINAL"}</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">CNPJ / CPF</span>
              <span className="font-semibold">{order.guestCpf || "—"}</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">DATA DA EMISSÃO</span>
              <span className="font-semibold">{datePart}</span>
            </div>
          </div>
          <div className="grid grid-cols-12 divide-x divide-black border-b border-black">
            <div className="col-span-6 p-1">
              <span className="text-[7px] text-dark/60 block">ENDEREÇO</span>
              <span className="font-semibold">{addr.street}, {addr.number} {addr.complement && `— ${addr.complement}`}</span>
            </div>
            <div className="col-span-3 p-1">
              <span className="text-[7px] text-dark/60 block">BAIRRO / DISTRITO</span>
              <span className="font-semibold">{addr.district}</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">CEP</span>
              <span className="font-semibold">{addr.zipCode}</span>
            </div>
            <div className="col-span-1 p-1">
              <span className="text-[7px] text-dark/60 block">DATA SAÍDA</span>
              <span className="font-semibold">{datePart}</span>
            </div>
          </div>
          <div className="grid grid-cols-12 divide-x divide-black">
            <div className="col-span-5 p-1">
              <span className="text-[7px] text-dark/60 block">MUNICÍPIO</span>
              <span className="font-semibold">{addr.city}</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">TELEFONE / FAX</span>
              <span className="font-semibold">{order.guestPhone || "—"}</span>
            </div>
            <div className="col-span-1 p-1">
              <span className="text-[7px] text-dark/60 block">UF</span>
              <span className="font-semibold">{(addr.state || "").toUpperCase()}</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">INSCRIÇÃO ESTADUAL</span>
              <span className="font-semibold">ISENTO</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">HORA DA SAÍDA</span>
              <span className="font-semibold">{timePart}</span>
            </div>
          </div>
        </div>

        {/* 4. DUPLICATAS / PAGAMENTO */}
        <h4 className="font-bold text-[9px] mb-1">FATURA / DUPLICATAS</h4>
        <div className="border border-black p-1.5 mb-2 text-center text-xs flex gap-6">
          <div>
            <span className="text-[7px] text-dark/60 block text-left">PAGAMENTO</span>
            <span className="font-semibold">{order.paymentMethod || "MERCADOPAGO"}</span>
          </div>
          <div>
            <span className="text-[7px] text-dark/60 block text-left">VENCIMENTO</span>
            <span className="font-semibold">{datePart}</span>
          </div>
          <div>
            <span className="text-[7px] text-dark/60 block text-left">VALOR ORIGINAL</span>
            <span className="font-semibold">{formatBRL(Number(order.total))}</span>
          </div>
        </div>

        {/* 5. CÁLCULO DO IMPOSTO */}
        <h4 className="font-bold text-[9px] mb-1">CÁLCULO DO IMPOSTO</h4>
        <div className="border border-black mb-2">
          <div className="grid grid-cols-5 divide-x divide-black border-b border-black text-[8px] text-center">
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">BASE DE CÁLCULO DO ICMS</span>
              <span className="font-semibold">0,00</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">VALOR DO ICMS</span>
              <span className="font-semibold">0,00</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">BASE DE CÁLCULO DO ICMS ST</span>
              <span className="font-semibold">0,00</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">VALOR DO ICMS ST</span>
              <span className="font-semibold">0,00</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">VALOR TOTAL DOS PRODUTOS</span>
              <span className="font-semibold">{formatBRL(totalProducts)}</span>
            </div>
          </div>
          <div className="grid grid-cols-5 divide-x divide-black text-[8px] text-center">
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">VALOR DO FRETE</span>
              <span className="font-semibold">{formatBRL(Number(order.shippingCost))}</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">VALOR DO SEGURO</span>
              <span className="font-semibold">0,00</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">DESCONTO</span>
              <span className="font-semibold">{formatBRL(totalDiscount)}</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">VALOR DO IPI</span>
              <span className="font-semibold">0,00</span>
            </div>
            <div className="p-1">
              <span className="text-[6px] text-dark/60 block text-left">VALOR TOTAL DA NOTA</span>
              <span className="font-semibold text-xs text-primary">{formatBRL(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* 6. TRANSPORTADOR / VOLUMES */}
        <h4 className="font-bold text-[9px] mb-1">TRANSPORTADOR / VOLUMES TRANSPORTADOS</h4>
        <div className="border border-black mb-2">
          <div className="grid grid-cols-12 divide-x divide-black border-b border-black">
            <div className="col-span-4 p-1">
              <span className="text-[7px] text-dark/60 block">RAZÃO SOCIAL</span>
              <span className="font-semibold">MELHOR ENVIO TRANSPORTES</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">FRETE POR CONTA</span>
              <span className="font-semibold">0 - REMETENTE (CIF)</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">CÓDIGO ANTT</span>
              <span className="font-semibold">—</span>
            </div>
            <div className="col-span-2 p-1">
              <span className="text-[7px] text-dark/60 block">PLACA DO VEÍCULO</span>
              <span className="font-semibold">—</span>
            </div>
            <div className="col-span-1 p-1">
              <span className="text-[7px] text-dark/60 block">UF</span>
              <span className="font-semibold">SP</span>
            </div>
            <div className="col-span-1 p-1">
              <span className="text-[7px] text-dark/60 block">CNPJ</span>
              <span className="font-semibold">—</span>
            </div>
          </div>
          <div className="grid grid-cols-12 divide-x divide-black">
            <div className="col-span-5 p-1">
              <span className="text-[7px] text-dark/60 block">ENDEREÇO</span>
              <span className="font-semibold">—</span>
            </div>
            <div className="col-span-3 p-1">
              <span className="text-[7px] text-dark/60 block">MUNICÍPIO</span>
              <span className="font-semibold">—</span>
            </div>
            <div className="col-span-1 p-1">
              <span className="text-[7px] text-dark/60 block">UF</span>
              <span className="font-semibold">—</span>
            </div>
            <div className="col-span-3 p-1">
              <span className="text-[7px] text-dark/60 block">INSCRIÇÃO ESTADUAL</span>
              <span className="font-semibold">—</span>
            </div>
          </div>
        </div>

        {/* 7. ITENS (Tabela) */}
        <h4 className="font-bold text-[9px] mb-1">DADOS DOS PRODUTOS / SERVIÇOS</h4>
        <div className="border border-black mb-2 overflow-hidden">
          <table className="w-full text-left border-collapse text-[8px]">
            <thead>
              <tr className="bg-black/5 border-b border-black text-[7px] font-semibold divide-x divide-black">
                <th className="px-1 py-0.5">CÓD. PROD.</th>
                <th className="px-1 py-0.5 w-[35%]">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                <th className="px-1 py-0.5">NCM</th>
                <th className="px-1 py-0.5">CST</th>
                <th className="px-1 py-0.5">CFOP</th>
                <th className="px-1 py-0.5">UN.</th>
                <th className="px-1 py-0.5 text-right">QUANT.</th>
                <th className="px-1 py-0.5 text-right">VALOR UNIT.</th>
                <th className="px-1 py-0.5 text-right">VALOR TOTAL</th>
                <th className="px-1 py-0.5 text-right">ALÍQ. ICMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/30">
              {order.items.map((it, idx) => {
                const itemNum = idx + 1;
                const isOutState = (addr.state || "").toUpperCase() !== "RJ";
                const cfop = isOutState ? "6102" : "5102";
                
                return (
                  <tr key={it.id} className="divide-x divide-black/30">
                    <td className="px-1 py-0.5 font-mono">LIV-{(idx+1).toString().padStart(3, "0")}</td>
                    <td className="px-1 py-0.5 font-semibold">{it.product.name}</td>
                    <td className="px-1 py-0.5">49019900</td>
                    <td className="px-1 py-0.5">400</td> {/* CSOSN 400 - Immune */}
                    <td className="px-1 py-0.5">{cfop}</td>
                    <td className="px-1 py-0.5">UN</td>
                    <td className="px-1 py-0.5 text-right">{it.quantity}</td>
                    <td className="px-1 py-0.5 text-right">{formatBRL(Number(it.price))}</td>
                    <td className="px-1 py-0.5 text-right">{formatBRL(it.quantity * Number(it.price))}</td>
                    <td className="px-1 py-0.5 text-right">0,00%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 8. DADOS ADICIONAIS */}
        <div className="grid grid-cols-12 border border-black divide-x divide-black">
          <div className="col-span-8 p-1.5 min-h-[60px]">
            <span className="text-[7px] text-dark/60 block mb-0.5">INFORMAÇÕES COMPLEMENTARES</span>
            <p className="text-[8px] font-semibold leading-relaxed">
              IMUNIDADE TRIBUTÁRIA DE LIVROS CONFORME ARTIGO 150, INCISO VI, ALÍNEA &quot;D&quot; DA CONSTITUIÇÃO FEDERAL DE 1988.<br />
              PEDIDO REFERÊNCIA: #{orderCodeOf(order.id)} / MERCADO PAGO ID: {order.paymentId || "—"}.<br />
              AMBIENTE DE HOMOLOGAÇÃO (SIMULAÇÃO SEFAZ).
            </p>
          </div>
          <div className="col-span-4 p-1.5">
            <span className="text-[7px] text-dark/60 block mb-0.5">RESERVADO AO FISCO</span>
            <span className="font-semibold block mt-1">—</span>
          </div>
        </div>

      </div>
    </div>
  );
}

