export type DocumentType = 'INVOICE' | 'PROFORMA' | 'RECEIPT';

export type TemplateStyle = 'classic' | 'modern' | 'compact';

export type TaxMode = 'standard_levies' | 'flat_vat' | 'no_tax';

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface TaxSettings {
  taxMode: TaxMode;
  nhilRate: number;      // e.g. 2.5%
  getfundRate: number;   // e.g. 2.5%
  vatRate: number;       // e.g. 15.0%
  flatVatRate: number;   // e.g. 3.0% (disables other taxes when selected)
  calculationMode: 'gra_compound' | 'flat'; // gra_compound: VAT applied to (Subtotal + Levies)
}

export interface ClientInfo {
  name: string;
  address: string;
  phone: string;
  attn: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  location: string;
  phone: string;
  logoUrl: string;
  bankAccount: string;
  bankBranch: string;
  paymentNotice: string;
}

export interface ReceiptDocument {
  id: string;
  docType: DocumentType;
  docNumber: string;
  date: string; // DD/MM/YYYY or YYYY-MM-DD
  terms: string;
  client: ClientInfo;
  items: LineItem[];
  currency: string;
  taxSettings: TaxSettings;
  company: CompanyInfo;
  notes: string;
  signatureText: string;
  templateStyle: TemplateStyle;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatedTotals {
  subtotal: number;
  taxMode: TaxMode;
  nhil: number;
  getfund: number;
  taxableSubtotal: number;
  vat: number;
  flatVat: number;
  grandTotal: number;
}
