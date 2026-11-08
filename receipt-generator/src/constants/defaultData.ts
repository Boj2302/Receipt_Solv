import type { CompanyInfo, TaxSettings, ClientInfo, ReceiptDocument } from '../types';
import { DEFAULT_LOGO_BASE64 } from '../assets/defaultLogoBase64';

export const DEFAULT_COMPANY: CompanyInfo = {
  name: 'WEB BISHOP TECHNOLOGY LTD',
  tagline: "Supply and Chip-Level Repairs of PC's, Laptops, WorkStations and Servers | Installations | Software & POS Systems | Security Systems & Many More.",
  location: 'Loc.: GT-178-8689 H-Lane H41, Tema Community 3',
  phone: 'Tel: +233 244663777',
  logoUrl: DEFAULT_LOGO_BASE64,
  bankAccount: '2104099100001',
  bankBranch: 'CBG Tema Community 2 Branch',
  paymentNotice: 'NB: All Payment shouyld be made in the name of WEB BISHOP TECHNOLOGY LTD',
};

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxMode: 'standard_levies',
  nhilRate: 2.5,
  getfundRate: 2.5,
  vatRate: 15.0,
  flatVatRate: 3.0, // Standard Ghana flat rate scheme
  calculationMode: 'gra_compound',
};

export const PRESET_CLIENTS: ClientInfo[] = [
  {
    name: 'Royal Crown',
    address: 'Spintex',
    phone: '0560911457',
    attn: 'Alexander Clerk',
  },
  {
    name: 'Killpest Ltd',
    address: 'Accra',
    phone: '+233 200000000',
    attn: 'Accounts Dept',
  },
  {
    name: 'KEK Insurance Brokers',
    address: 'Accra',
    phone: '+233 240000000',
    attn: 'Mr David Ofori',
  },
  {
    name: 'Pharmasymbiosis Ltd',
    address: 'Accra',
    phone: '+233 270000000',
    attn: 'Purchasing Unit',
  },
  {
    name: 'Royal Sweet Ltd',
    address: 'Accra',
    phone: '+233 240112233',
    attn: 'Manager',
  },
];

export const QUICK_SERVICES: { description: string; unitPrice: number }[] = [
  { description: 'HP Laptop Battery Replacement', unitPrice: 800 },
  { description: 'HP 15.6" Touch Screen', unitPrice: 1500 },
  { description: 'Original HP X360 New Housing', unitPrice: 3000 },
  { description: 'Motherboard Treatment & Servicing', unitPrice: 100 },
  { description: 'Motherboard Chip replacement and repairs', unitPrice: 800 },
  { description: 'HP Laptop Liquid damage motherboard replacement', unitPrice: 2750 },
  { description: 'Service Charge / Labor', unitPrice: 350 },
  { description: 'Keyboard & Touch Pad replacement', unitPrice: 950 },
  { description: 'M.2 SATA SSD 512GB + Installation', unitPrice: 600 },
  { description: 'Display Cable replacement', unitPrice: 100 },
  { description: 'Windows OS Fresh Installation & Drivers setup', unitPrice: 350 },
  { description: 'Laptop Cooling Fan Replacement', unitPrice: 350 },
  { description: 'Power Module repair / replacement', unitPrice: 750 },
  { description: 'WiFi Card replacement', unitPrice: 150 },
];

export const getTodayDateFormatted = (): string => {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const y = today.getFullYear();
  return `${d}/${m}/${y}`;
};

export const INITIAL_DOCUMENT: ReceiptDocument = {
  id: 'doc_' + Date.now(),
  docType: 'INVOICE',
  docNumber: '2026001',
  date: getTodayDateFormatted(),
  terms: 'Due on Receipt',
  client: {
    name: 'Royal Crown',
    address: 'Spintex',
    phone: '0560911457',
    attn: 'Alexander Clerk',
  },
  items: [
    {
      id: 'item_1',
      description: 'HP 15 Laptop Battery Replacement',
      qty: 2,
      unitPrice: 800,
    },
    {
      id: 'item_2',
      description: 'Hp 15.6" Touch Screen',
      qty: 1,
      unitPrice: 1500,
    },
    {
      id: 'item_3',
      description: 'Hp 15 Cooling Fan Replacement',
      qty: 1,
      unitPrice: 350,
    },
    {
      id: 'item_4',
      description: 'Service Charge / Installation Labor',
      qty: 1,
      unitPrice: 500,
    },
  ],
  currency: 'Ghc',
  taxSettings: { ...DEFAULT_TAX_SETTINGS },
  company: { ...DEFAULT_COMPANY },
  notes: 'All items repaired come with 3 months limited service warranty.',
  signatureText: 'Signature:……………………………….',
  templateStyle: 'classic',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
