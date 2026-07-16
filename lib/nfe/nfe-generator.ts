import { Decimal } from "@prisma/client/runtime/library";

export interface NfeIssuerInfo {
  cnpj: string;
  ie: string;
  name: string;
  tradeName: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  cityCode: string; // IBGE code (7 digits), eg: "3304557" for Rio de Janeiro
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  ufCode: string; // IBGE UF code (2 digits), eg: "33" for RJ
}

export interface NfeRecipientInfo {
  cpfOrCnpj: string;
  name: string;
  email: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  cityCode: string; // IBGE city code, default "3304557"
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
}

export interface NfeItemInfo {
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface NfeData {
  orderId: string;
  orderNumber: string;
  createdAt: Date;
  items: NfeItemInfo[];
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  recipient: NfeRecipientInfo;
}

// Map Brazilian States (UF) to IBGE Codes
export const UF_IBGE_CODES: Record<string, string> = {
  AC: "12", AL: "27", AM: "13", AP: "16", BA: "29", CE: "23",
  DF: "53", ES: "32", GO: "52", MA: "21", MG: "31", MS: "50",
  MT: "51", PA: "15", PB: "25", PE: "26", PI: "22", PR: "41",
  RJ: "33", RN: "24", RO: "11", RR: "14", RS: "43", SC: "42",
  SE: "28", SP: "35", TO: "17"
};

/**
 * Calculates the Modulo 11 check digit for a 43-digit NF-e key.
 */
export function calculateCheckDigit(key43: string): number {
  let sum = 0;
  let weight = 2;
  
  for (let i = key43.length - 1; i >= 0; i--) {
    sum += parseInt(key43.charAt(i), 10) * weight;
    weight++;
    if (weight > 9) weight = 2;
  }
  
  const remainder = sum % 11;
  if (remainder === 0 || remainder === 1) return 0;
  return 11 - remainder;
}

/**
 * Generates a 44-digit NF-e Access Key.
 */
export function generateAccessKey(params: {
  ufCode: string;
  date: Date;
  cnpj: string;
  model: string;
  series: string;
  number: string;
  emissionType: string;
  numericCode: string;
}): { key: string; checkDigit: number } {
  // Format Date to YYMM
  const year = params.date.getFullYear().toString().slice(-2);
  const month = (params.date.getMonth() + 1).toString().padStart(2, "0");
  const aamm = `${year}${month}`;
  
  // Clean CNPJ (keep only digits)
  const cleanCnpj = params.cnpj.replace(/\D/g, "").padStart(14, "0");
  
  // Format fields to official lengths
  const uf = params.ufCode.padStart(2, "0");
  const model = params.model.padStart(2, "0");
  const series = params.series.padStart(3, "0");
  const number = params.number.padStart(9, "0");
  const type = params.emissionType.padStart(1, "0");
  const code = params.numericCode.replace(/\D/g, "").slice(0, 8).padStart(8, "0");
  
  const key43 = `${uf}${aamm}${cleanCnpj}${model}${series}${number}${type}${code}`;
  const checkDigit = calculateCheckDigit(key43);
  
  return {
    key: `${key43}${checkDigit}`,
    checkDigit
  };
}

/**
 * Escapes characters for XML.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formats a number to NF-e standard decimal (e.g. 10.00).
 */
function formatDec(val: number, decimals: number = 2): string {
  return val.toFixed(decimals);
}

/**
 * Generates a mock, syntactically valid SEFAZ NF-e XML.
 */
export function generateNfeXml(data: NfeData, issuer: NfeIssuerInfo): { xml: string; key: string; number: string; series: string } {
  const numberInt = Math.floor(Math.random() * 900000) + 100000;
  const number = numberInt.toString().padStart(9, "0");
  const series = "001";
  
  const ufCode = UF_IBGE_CODES[issuer.state.toUpperCase()] || "33";
  // Generate random numeric code (8 digits)
  const numericCode = Math.floor(10000000 + Math.random() * 90000000).toString();
  
  const { key } = generateAccessKey({
    ufCode,
    date: data.createdAt,
    cnpj: issuer.cnpj,
    model: "55", // standard NF-e
    series,
    number,
    emissionType: "1", // normal emission
    numericCode
  });
  
  const protocol = Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
  const protocolDateStr = new Date().toISOString().replace(/\.\d+Z$/, "-03:00");
  const emissionDateStr = data.createdAt.toISOString().replace(/\.\d+Z$/, "-03:00");
  
  const cleanIssuerCnpj = issuer.cnpj.replace(/\D/g, "");
  const cleanRecipientCpfOrCnpj = data.recipient.cpfOrCnpj.replace(/\D/g, "");
  const isCnpj = cleanRecipientCpfOrCnpj.length > 11;
  const destDocTag = isCnpj ? "CNPJ" : "CPF";
  
  // NFe XML generation
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">\n`;
  xml += `  <NFe>\n`;
  xml += `    <infNFe Id="NFe${key}" versao="4.00">\n`;
  
  // 1. IDE (Identification of the NF-e)
  xml += `      <ide>\n`;
  xml += `        <cUF>${ufCode}</cUF>\n`;
  xml += `        <cNF>${numericCode}</cNF>\n`;
  xml += `        <natOp>Venda de mercadoria adquirida ou recebida de terceiros</natOp>\n`;
  xml += `        <mod>55</mod>\n`;
  xml += `        <serie>${parseInt(series, 10)}</serie>\n`;
  xml += `        <nNF>${parseInt(number, 10)}</nNF>\n`;
  xml += `        <dhEmi>${emissionDateStr}</dhEmi>\n`;
  xml += `        <tpNF>1</tpNF>\n`; // Outflow
  xml += `        <idDest>1</idDest>\n`; // Internal operation (within state)
  xml += `        <cMunFG>${issuer.cityCode}</cMunFG>\n`;
  xml += `        <tpImp>1</tpImp>\n`; // Portrait DANFE
  xml += `        <tpEmis>1</tpEmis>\n`; // Normal
  xml += `        <cDV>${key.slice(-1)}</cDV>\n`;
  xml += `        <tpAmb>2</tpAmb>\n`; // 2 = Homologation (Simulated/Sandbox)
  xml += `        <finNFe>1</finNFe>\n`; // Normal NF-e
  xml += `        <indFinal>1</indFinal>\n`; // Final consumer
  xml += `        <indPres>2</indPres>\n`; // Internet/Non-presencial
  xml += `        <procEmi>0</procEmi>\n`; // Application SEFAZ
  xml += `        <verProc>1.0.0_EraUmaVezEu</verProc>\n`;
  xml += `      </ide>\n`;
  
  // 2. EMIT (Issuer details)
  xml += `      <emit>\n`;
  xml += `        <CNPJ>${cleanIssuerCnpj}</CNPJ>\n`;
  xml += `        <xNome>${escapeXml(issuer.name)}</xNome>\n`;
  xml += `        <xFant>${escapeXml(issuer.tradeName)}</xFant>\n`;
  xml += `        <enderEmit>\n`;
  xml += `          <xlgr>${escapeXml(issuer.street)}</xlgr>\n`;
  xml += `          <nro>${escapeXml(issuer.number)}</nro>\n`;
  if (issuer.complement) xml += `          <xCpl>${escapeXml(issuer.complement)}</xCpl>\n`;
  xml += `          <xBairro>${escapeXml(issuer.district)}</xBairro>\n`;
  xml += `          <cMun>${issuer.cityCode}</cMun>\n`;
  xml += `          <xMun>${escapeXml(issuer.city)}</xMun>\n`;
  xml += `          <UF>${issuer.state.toUpperCase()}</UF>\n`;
  xml += `          <CEP>${issuer.zipCode.replace(/\D/g, "")}</CEP>\n`;
  xml += `          <cPais>1058</cPais>\n`;
  xml += `          <xPais>BRASIL</xPais>\n`;
  if (issuer.phone) xml += `          <fone>${issuer.phone.replace(/\D/g, "")}</fone>\n`;
  xml += `        </enderEmit>\n`;
  xml += `        <IE>${issuer.ie.replace(/\D/g, "")}</IE>\n`;
  xml += `        <CRT>1</CRT>\n`; // Simples Nacional
  xml += `      </emit>\n`;
  
  // 3. DEST (Recipient details)
  xml += `      <dest>\n`;
  xml += `        <${destDocTag}>${cleanRecipientCpfOrCnpj}</${destDocTag}>\n`;
  xml += `        <xNome>${escapeXml(data.recipient.name)}</xNome>\n`;
  xml += `        <enderDest>\n`;
  xml += `          <xlgr>${escapeXml(data.recipient.street)}</xlgr>\n`;
  xml += `          <nro>${escapeXml(data.recipient.number)}</nro>\n`;
  if (data.recipient.complement) xml += `          <xCpl>${escapeXml(data.recipient.complement)}</xCpl>\n`;
  xml += `          <xBairro>${escapeXml(data.recipient.district)}</xBairro>\n`;
  xml += `          <cMun>${data.recipient.cityCode || "3304557"}</cMun>\n`;
  xml += `          <xMun>${escapeXml(data.recipient.city)}</xMun>\n`;
  xml += `          <UF>${data.recipient.state.toUpperCase()}</UF>\n`;
  xml += `          <CEP>${data.recipient.zipCode.replace(/\D/g, "")}</CEP>\n`;
  xml += `          <cPais>1058</cPais>\n`;
  xml += `          <xPais>BRASIL</xPais>\n`;
  if (data.recipient.phone) xml += `          <fone>${data.recipient.phone.replace(/\D/g, "")}</fone>\n`;
  xml += `        </enderDest>\n`;
  xml += `        <indIEDest>9</indIEDest>\n`; // IE não contribuinte
  xml += `        <email>${escapeXml(data.recipient.email)}</email>\n`;
  xml += `      </dest>\n`;
  
  // 4. DET (Items Details)
  let itemTotalSum = 0;
  data.items.forEach((item, idx) => {
    const itemNum = idx + 1;
    const itemTotal = item.quantity * item.price;
    const itemDiscount = item.discount || 0;
    const itemNetTotal = itemTotal - itemDiscount;
    itemTotalSum += itemNetTotal;
    
    // CFOP for retail sales: 5102 (within state), 6102 (outside state)
    const isOutState = data.recipient.state.toUpperCase() !== issuer.state.toUpperCase();
    const cfop = isOutState ? "6102" : "5102";
    
    xml += `      <det nItem="${itemNum}">\n`;
    xml += `        <prod>\n`;
    xml += `          <cProd>LIV-${itemNum.toString().padStart(3, "0")}</cProd>\n`;
    xml += `          <cEAN>SEM GTIN</cEAN>\n`;
    xml += `          <xProd>${escapeXml(item.name)}</xProd>\n`;
    xml += `          <NCM>49019900</NCM>\n`; // NCM 4901.99.00 - Livros
    xml += `          <CFOP>${cfop}</CFOP>\n`;
    xml += `          <uCom>UN</uCom>\n`;
    xml += `          <qCom>${formatDec(item.quantity, 4)}</qCom>\n`;
    xml += `          <vUnCom>${formatDec(item.price, 4)}</vUnCom>\n`;
    xml += `          <vProd>${formatDec(itemTotal, 2)}</vProd>\n`;
    xml += `          <cEANTrib>SEM GTIN</cEANTrib>\n`;
    xml += `          <uTrib>UN</uTrib>\n`;
    xml += `          <qTrib>${formatDec(item.quantity, 4)}</qTrib>\n`;
    xml += `          <vUnTrib>${formatDec(item.price, 4)}</vUnTrib>\n`;
    if (itemDiscount > 0) xml += `          <vDesc>${formatDec(itemDiscount, 2)}</vDesc>\n`;
    xml += `          <indTot>1</indTot>\n`; // Compõe o valor total da NF-e
    xml += `        </prod>\n`;
    
    // Taxes: Books are exempt (Immunity)
    xml += `        <imposto>\n`;
    xml += `          <ICMS>\n`;
    // Simples Nacional - CSOSN 400 (Non-taxable / Immune)
    xml += `            <ICMSSN400>\n`;
    xml += `              <orig>0</orig>\n`; // National
    xml += `              <CSOSN>400</CSOSN>\n`; // Immune
    xml += `            </ICMSSN400>\n`;
    xml += `          </ICMS>\n`;
    xml += `          <PIS>\n`;
    // PIS non-taxable / immune (CST 08)
    xml += `            <PISNT>\n`;
    xml += `              <CST>08</CST>\n`;
    xml += `            </PISNT>\n`;
    xml += `          </PIS>\n`;
    xml += `          <COFINS>\n`;
    // COFINS non-taxable / immune (CST 08)
    xml += `            <COFINSNT>\n`;
    xml += `              <CST>08</CST>\n`;
    xml += `            </COFINSNT>\n`;
    xml += `          </COFINS>\n`;
    xml += `        </imposto>\n`;
    xml += `      </det>\n`;
  });
  
  // 5. TOTAL
  const calculatedTotal = itemTotalSum + data.shippingCost;
  xml += `      <total>\n`;
  xml += `        <ICMSTot>\n`;
  xml += `          <vBC>0.00</vBC>\n`;
  xml += `          <vICMS>0.00</vICMS>\n`;
  xml += `          <vICMSDeson>0.00</vICMSDeson>\n`;
  xml += `          <vFCP>0.00</vFCP>\n`;
  xml += `          <vBCST>0.00</vBCST>\n`;
  xml += `          <vST>0.00</vST>\n`;
  xml += `          <vFCPST>0.00</vFCPST>\n`;
  xml += `          <vFCPSTRet>0.00</vFCPSTRet>\n`;
  xml += `          <vProd>${formatDec(data.items.reduce((acc, x) => acc + (x.quantity * x.price), 0), 2)}</vProd>\n`;
  xml += `          <vFrete>${formatDec(data.shippingCost, 2)}</vFrete>\n`;
  xml += `          <vSeg>0.00</vSeg>\n`;
  xml += `          <vDesc>${formatDec(data.discount, 2)}</vDesc>\n`;
  xml += `          <vII>0.00</vII>\n`;
  xml += `          <vIPI>0.00</vIPI>\n`;
  xml += `          <vIPIDevol>0.00</vIPIDevol>\n`;
  xml += `          <vPIS>0.00</vPIS>\n`;
  xml += `          <vCOFINS>0.00</vCOFINS>\n`;
  xml += `          <vOutro>0.00</vOutro>\n`;
  xml += `          <vNF>${formatDec(calculatedTotal, 2)}</vNF>\n`;
  xml += `        </ICMSTot>\n`;
  xml += `      </total>\n`;
  
  // 6. TRANSP (Transport details)
  xml += `      <transp>\n`;
  xml += `        <modFrete>0</modFrete>\n`; // 0 = CIF (remetente paga)
  xml += `        <transporta>\n`;
  xml += `          <xNome>MELHOR ENVIO TRANSPORTES</xNome>\n`;
  xml += `        </transporta>\n`;
  xml += `      </transp>\n`;
  
  // 7. PAG (Payment)
  xml += `      <pag>\n`;
  xml += `        <detPag>\n`;
  // Map payment method to SEFAZ codes: 03 = Credit card, 15 = Boleto, 17 = PIX, 99 = Others
  let tPag = "99";
  const pmLower = (data.paymentMethod || "").toLowerCase();
  if (pmLower.includes("pix")) tPag = "17";
  else if (pmLower.includes("credit") || pmLower.includes("cartao")) tPag = "03";
  else if (pmLower.includes("boleto")) tPag = "15";
  
  xml += `          <tPag>${tPag}</tPag>\n`;
  xml += `          <vPag>${formatDec(calculatedTotal, 2)}</vPag>\n`;
  xml += `        </detPag>\n`;
  xml += `      </pag>\n`;
  
  // 8. INFADIC (Additional info)
  xml += `      <infAdic>\n`;
  xml += `        <infCpl>Imunidade Tributaria de Livros conforme Artigo 150, Inciso VI, alinea 'd' da Constituicao Federal de 1988. Pedido #${data.orderNumber}. Ambiente de homologacao (simulado).</infCpl>\n`;
  xml += `      </infAdic>\n`;
  
  xml += `    </infNFe>\n`;
  
  // SEFAZ Signature placeholder (in real systems, XML signature is here)
  xml += `    <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">\n`;
  xml += `      <SignedInfo>\n`;
  xml += `        <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />\n`;
  xml += `        <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1" />\n`;
  xml += `        <Reference URI="#NFe${key}">\n`;
  xml += `          <Transforms>\n`;
  xml += `            <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature" />\n`;
  xml += `            <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />\n`;
  xml += `          </Transforms>\n`;
  xml += `          <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />\n`;
  xml += `          <DigestValue>MOCKDIGESTVALUEnfeProcSimulado</DigestValue>\n`;
  xml += `        </Reference>\n`;
  xml += `      </SignedInfo>\n`;
  xml += `      <SignatureValue>MOCKSIGNATUREVALUE1234567890abcdef</SignatureValue>\n`;
  xml += `    </Signature>\n`;
  xml += `  </NFe>\n`;
  
  // 9. PROTNFE (SEFAZ approval protocol)
  xml += `  <protNFe versao="4.00">\n`;
  xml += `    <infProt>\n`;
  xml += `      <tpAmb>2</tpAmb>\n`; // Homologation
  xml += `      <verAplic>1.0.0_EraUmaVezEu</verAplic>\n`;
  xml += `      <chNFe>${key}</chNFe>\n`;
  xml += `      <dhRecb>${protocolDateStr}</dhRecb>\n`;
  xml += `      <nProt>${protocol}</nProt>\n`;
  xml += `      <digVal>MOCKDIGESTVALUEnfeProcSimulado</digVal>\n`;
  xml += `      <cStat>100</cStat>\n`; // 100 = Authorized (Authorized use of NF-e)
  xml += `      <xMotiv>Autorizado o uso da NF-e</xMotiv>\n`;
  xml += `    </infProt>\n`;
  xml += `  </protNFe>\n`;
  
  xml += `</nfeProc>\n`;
  
  return { xml, key, number, series };
}
