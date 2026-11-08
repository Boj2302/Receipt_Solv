import type { ReceiptDocument, ClientInfo, CompanyInfo, TaxSettings } from '../types';
import { PRESET_CLIENTS, DEFAULT_COMPANY, DEFAULT_TAX_SETTINGS } from '../constants/defaultData';

const KEYS = {
  HISTORY: 'receipt_history_v1',
  CLIENTS: 'receipt_clients_v1',
  COMPANY: 'receipt_company_v1',
  TAX: 'receipt_tax_settings_v1',
  NEXT_INV_NUM: 'receipt_next_invoice_number_v1',
};

// Document History
export const getHistory = (): ReceiptDocument[] => {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading history:', e);
    return [];
  }
};

export const saveToHistory = (doc: ReceiptDocument): ReceiptDocument[] => {
  try {
    const history = getHistory();
    const existingIndex = history.findIndex((item) => item.id === doc.id);
    const updatedDoc = { ...doc, updatedAt: new Date().toISOString() };
    
    let newHistory: ReceiptDocument[];
    if (existingIndex >= 0) {
      newHistory = [...history];
      newHistory[existingIndex] = updatedDoc;
    } else {
      newHistory = [updatedDoc, ...history];
      // Increment the sequential counter if this was a new document
      advanceInvoiceNumber(doc.docNumber);
    }
    
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(newHistory));
    return newHistory;
  } catch (e) {
    console.error('Error saving document:', e);
    return [];
  }
};

export const deleteFromHistory = (id: string): ReceiptDocument[] => {
  try {
    const history = getHistory().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.error('Error deleting document:', e);
    return [];
  }
};

// Sequential Ordered Invoice Number Logic
export const incrementInvoiceNumber = (numStr: string): string => {
  const match = numStr.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const digits = match[2];
    const nextVal = (parseInt(digits, 10) + 1).toString();
    const padded = nextVal.padStart(digits.length, '0');
    return `${prefix}${padded}`;
  }
  // Fallback if no digits found: append -001
  return `${numStr}-001`;
};

export const getNextOrderedInvoiceNumber = (): string => {
  try {
    const stored = localStorage.getItem(KEYS.NEXT_INV_NUM);
    if (stored && stored.trim()) {
      return stored.trim();
    }

    // Otherwise find highest numeric invoice number from history
    const history = getHistory();
    let highest = 2026000;
    history.forEach((d) => {
      const match = d.docNumber.match(/(\d{4,})/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > highest && val < 2999999) {
          highest = val;
        }
      }
    });

    const next = (highest + 1).toString();
    localStorage.setItem(KEYS.NEXT_INV_NUM, incrementInvoiceNumber(next));
    return next;
  } catch (e) {
    return '2026001';
  }
};

export const advanceInvoiceNumber = (savedNumber: string): void => {
  try {
    const next = incrementInvoiceNumber(savedNumber);
    localStorage.setItem(KEYS.NEXT_INV_NUM, next);
  } catch (e) {
    console.error('Error advancing invoice number:', e);
  }
};

export const setNextInvoiceNumberSetting = (nextNumber: string): void => {
  localStorage.setItem(KEYS.NEXT_INV_NUM, nextNumber.trim());
};

export const getCurrentConfiguredNextNumber = (): string => {
  return localStorage.getItem(KEYS.NEXT_INV_NUM) || '2026001';
};

// Clients
export const getSavedClients = (): ClientInfo[] => {
  try {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : PRESET_CLIENTS;
  } catch (e) {
    return PRESET_CLIENTS;
  }
};

export const saveClient = (client: ClientInfo): ClientInfo[] => {
  const clients = getSavedClients();
  const exists = clients.findIndex(c => c.name.toLowerCase() === client.name.toLowerCase());
  let updated: ClientInfo[];
  if (exists >= 0) {
    updated = [...clients];
    updated[exists] = client;
  } else {
    updated = [client, ...clients];
  }
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updated));
  return updated;
};

// Company Info
export const getSavedCompany = (): CompanyInfo => {
  try {
    const data = localStorage.getItem(KEYS.COMPANY);
    return data ? JSON.parse(data) : DEFAULT_COMPANY;
  } catch (e) {
    return DEFAULT_COMPANY;
  }
};

export const saveCompanyInfo = (info: CompanyInfo): void => {
  localStorage.setItem(KEYS.COMPANY, JSON.stringify(info));
};

// Tax Settings
export const getSavedTaxSettings = (): TaxSettings => {
  try {
    const data = localStorage.getItem(KEYS.TAX);
    return data ? JSON.parse(data) : DEFAULT_TAX_SETTINGS;
  } catch (e) {
    return DEFAULT_TAX_SETTINGS;
  }
};

export const saveTaxSettings = (settings: TaxSettings): void => {
  localStorage.setItem(KEYS.TAX, JSON.stringify(settings));
};
