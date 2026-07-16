import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { orderCodeOf } from "@/lib/orders/build-order";
import { getSiteSettings } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function EtiquetaPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      shippingAddress: true,
    },
  });

  if (!order || !order.shippingAddress) {
    notFound();
  }

  const addr = order.shippingAddress;
  const isSedex = order.shippingMethod?.toUpperCase() === "SEDEX";
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-cream-light py-8 px-4 flex flex-col items-center print:bg-white print:p-0 select-text">
      {/* Print Controls (hidden on print) */}
      <div className="mb-6 w-full max-w-[396px] flex items-center justify-between border-b border-gold/25 pb-4 print:hidden bg-white p-4 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-sm font-serif text-primary">Etiqueta de Postagem</h1>
          <p className="text-[10px] text-dark/60">Layout térmico padrão (10x15cm).</p>
        </div>
        <div className="flex gap-1.5">
          <Link
            href="/admin/envios"
            className="bg-white border border-gold/30 hover:bg-gold/5 text-primary text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition"
          >
            Voltar
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary-dark text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Thermographic Label Container (100mm x 150mm approx. scale: 396px width) */}
      <div className="w-[396px] border-[2px] border-black p-3 bg-white text-dark font-sans leading-tight relative shadow-md print:shadow-none print:border-black print:my-0">
        
        {/* Header - Service Indicator */}
        <div className="flex justify-between items-stretch border-b-[2px] border-black pb-2 mb-2">
          <div className="flex flex-col justify-between">
            <span className="font-serif text-sm font-bold text-primary">ERA UMA VEZ EU</span>
            <span className="text-[7px] font-mono text-dark/70">CHANCELA MELHOR ENVIO</span>
          </div>
          <div className="flex flex-col items-center justify-center border-l-2 border-black pl-3 text-center">
            {/* Big Service Indicator */}
            <div className="bg-black text-white font-black text-lg px-4 py-1 tracking-wider leading-none">
              {isSedex ? "SEDEX" : "PAC"}
            </div>
            <span className="text-[7px] font-mono mt-0.5">CONTRATO: 9912482738</span>
          </div>
        </div>

        {/* Routing Barcode Placeholder */}
        <div className="flex flex-col items-center justify-center py-2 border-b-[2px] border-black mb-2">
          <span className="text-[7px] font-semibold tracking-wider mb-1">CÓDIGO DE ROTEAMENTO (CEP DESTINO)</span>
          <div className="h-10 w-full flex justify-around items-stretch bg-black text-white text-[6px] tracking-[0.55em] font-mono leading-none select-none">
            ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
          </div>
          <span className="text-[10px] font-bold mt-1 font-mono tracking-widest">{addr.zipCode}</span>
        </div>

        {/* Tracking Barcode */}
        <div className="flex flex-col items-center justify-center py-2 border-b-[2px] border-black mb-2">
          <span className="text-[7px] font-semibold tracking-wider mb-1">CÓDIGO DE RASTREAMENTO</span>
          <div className="h-10 w-full flex justify-around items-stretch bg-black text-white text-[6px] tracking-[0.55em] font-mono leading-none select-none">
            ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
          </div>
          <span className="text-[11px] font-bold mt-1 font-mono tracking-widest">{order.trackingCode || "QH123456789BR"}</span>
        </div>

        {/* Recipient Details */}
        <div className="py-2 border-b-[2px] border-black mb-2 text-xs">
          <span className="text-[7px] font-bold text-dark/70 block uppercase">DESTINATÁRIO:</span>
          <p className="font-bold text-sm text-dark mt-0.5 leading-none">{addr.name.toUpperCase()}</p>
          <p className="mt-1 font-medium leading-tight">
            {addr.street.toUpperCase()}, {addr.number}
            {addr.complement && ` — ${addr.complement.toUpperCase()}`}
          </p>
          <p className="font-medium">{addr.district.toUpperCase()}</p>
          <p className="font-bold text-sm mt-1">{addr.zipCode} — {addr.city.toUpperCase()} / {addr.state.toUpperCase()}</p>
          {order.guestPhone && <p className="text-[9px] mt-0.5 font-semibold text-dark/70">FONE: {order.guestPhone}</p>}
        </div>

        {/* Sender Details */}
        <div className="py-1 text-[9px] border-b border-black/40 mb-2 leading-snug">
          <span className="text-[6px] font-bold text-dark/60 block uppercase">REMETENTE:</span>
          <p className="font-semibold text-dark/95 leading-none">{settings.siteName.toUpperCase()} / ERA UMA VEZ EU</p>
          <p className="text-dark/80">AVENIDA RIO BRANCO, 156 - SALA 2602 - CENTRO</p>
          <p className="font-semibold text-dark/90">20040-003 — RIO DE JANEIRO / RJ</p>
        </div>

        {/* Package specifications and Invoicing ref */}
        <div className="grid grid-cols-2 text-[8px] leading-tight">
          <div>
            <p className="text-[6px] text-dark/50 uppercase">Nota Fiscal / Doc Ref:</p>
            <p className="font-semibold">{order.nfeNumber ? `NFe: ${order.nfeNumber}` : "DECLARAÇÃO DE CONTEÚDO"}</p>
            {order.nfeKey && <p className="font-mono text-[7px] break-all max-w-[170px] mt-0.5">{order.nfeKey.slice(0, 20)}...</p>}
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-[6px] text-dark/50 uppercase">Peso / Dimensões:</p>
            <p className="font-semibold">0.600 KG — 22x31x4 cm</p>
            <p className="font-semibold text-primary font-mono text-[7px] mt-0.5">REF: #{orderCodeOf(order.id)}</p>
          </div>
        </div>

        {/* Scissors cut indicator */}
        <div className="absolute top-full left-0 right-0 h-4 border-t border-dashed border-black/40 mt-1 flex justify-center items-center print:hidden">
          <span className="text-[8px] text-dark/55 bg-cream-light px-2">Dobrar ou cortar aqui</span>
        </div>

      </div>
    </div>
  );
}
