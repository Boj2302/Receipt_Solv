import type { ReceiptDocument, ClientInfo, CompanyInfo, TaxSettings } from '../types';
import { PRESET_CLIENTS, DEFAULT_COMPANY, DEFAULT_TAX_SETTINGS } from '../constants/defaultData';

const KEYS = {
  HISTORY: 'receipt_history_v1',
  DELETED_HISTORY: 'receipt_deleted_history_v1',
  CLIENTS: 'receipt_clients_v1',
  COMPANY: 'receipt_company_v1',
  TAX: 'receipt_tax_settings_v1',
  NEXT_INV_NUM: 'receipt_next_invoice_number_v1',
};

// Document History (Active)
export const getHistory = (): ReceiptDocument[] => {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading history:', e);
    return [];
  }
};

export const setHistory = (history: ReceiptDocument[]): void => {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history to localStorage:', e);
  }
};

// Deleted History (Recovery / Trash)
export const getDeletedHistory = (): ReceiptDocument[] => {
  try {
    const data = localStorage.getItem(KEYS.DELETED_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading deleted history:', e);
    return [];
  }
};

export const setDeletedHistory = (deleted: ReceiptDocument[]): void => {
  try {
    localStorage.setItem(KEYS.DELETED_HISTORY, JSON.stringify(deleted));
  } catch (e) {
    console.error('Error saving deleted history to localStorage:', e);
  }
};

export const saveToHistory = (doc: ReceiptDocument): ReceiptDocument[] => {
  try {
    const history = getHistory();
    const existingIndex = history.findIndex((item) => item.id === doc.id);
    const updatedDoc = {
      ...doc,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    
    let newHistory: ReceiptDocument[];
    if (existingIndex >= 0) {
      newHistory = [...history];
      newHistory[existingIndex] = updatedDoc;
    } else {
      newHistory = [updatedDoc, ...history];
      // Increment sequential counter if this was a new document
      advanceInvoiceNumber(doc.docNumber);
    }
    
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(newHistory));
    return newHistory;
  } catch (e) {
    console.error('Error saving document:', e);
    return [];
  }
};

/**
 * Soft delete: Removes document from active history and adds to deleted archive
 * with deletion timestamp. This allows instant recovery!
 */
export const softDeleteFromHistory = (id: string): { active: ReceiptDocument[]; deleted: ReceiptDocument[] } => {
  try {
    const history = getHistory();
    const target = history.find((item) => item.id === id);
    const updatedActive = history.filter((item) => item.id !== id);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedActive));

    let updatedDeleted = getDeletedHistory();
    if (target) {
      const deletedDoc: ReceiptDocument = {
        ...target,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      };
      updatedDeleted = [deletedDoc, ...updatedDeleted.filter((item) => item.id !== id)];
      localStorage.setItem(KEYS.DELETED_HISTORY, JSON.stringify(updatedDeleted));
    }

    return { active: updatedActive, deleted: updatedDeleted };
  } catch (e) {
    console.error('Error soft deleting document:', e);
    return { active: getHistory(), deleted: getDeletedHistory() };
  }
};

/**
 * Recovers a deleted document back to active history.
 */
export const restoreFromDeleted = (id: string): { active: ReceiptDocument[]; deleted: ReceiptDocument[] } => {
  try {
    const deleted = getDeletedHistory();
    const target = deleted.find((item) => item.id === id);
    const updatedDeleted = deleted.filter((item) => item.id !== id);
    localStorage.setItem(KEYS.DELETED_HISTORY, JSON.stringify(updatedDeleted));

    let updatedActive = getHistory();
    if (target) {
      const restoredDoc: ReceiptDocument = {
        ...target,
        isDeleted: false,
        deletedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
      updatedActive = [restoredDoc, ...updatedActive.filter((item) => item.id !== id)];
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedActive));
    }

    return { active: updatedActive, deleted: updatedDeleted };
  } catch (e) {
    console.error('Error restoring document:', e);
    return { active: getHistory(), deleted: getDeletedHistory() };
  }
};

/**
 * Permanently deletes a document from trash.
 */
export const permanentDeleteFromDeleted = (id: string): ReceiptDocument[] => {
  try {
    const deleted = getDeletedHistory().filter((item) => item.id !== id);
    localStorage.setItem(KEYS.DELETED_HISTORY, JSON.stringify(deleted));
    return deleted;
  } catch (e) {
    console.error('Error permanently deleting document:', e);
    return [];
  }
};

/**
 * Restores all deleted documents at once.
 */
export const restoreAllFromDeleted = (): { active: ReceiptDocument[]; deleted: ReceiptDocument[] } => {
  try {
    const deleted = getDeletedHistory();
    const active = getHistory();
    const restored = deleted.map((d) => ({
      ...d,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    }));

    const newActive = [...restored, ...active];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(newActive));
    localStorage.setItem(KEYS.DELETED_HISTORY, JSON.stringify([]));

    return { active: newActive, deleted: [] };
  } catch (e) {
    console.error('Error restoring all documents:', e);
    return { active: getHistory(), deleted: getDeletedHistory() };
  }
};

// Legacy alias
export const deleteFromHistory = (id: string): ReceiptDocument[] => {
  return softDeleteFromHistory(id).active;
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return DEFAULT_TAX_SETTINGS;
  }
};

export const saveTaxSettings = (settings: TaxSettings): void => {
  localStorage.setItem(KEYS.TAX, JSON.stringify(settings));
};
