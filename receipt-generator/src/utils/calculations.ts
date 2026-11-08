import type { LineItem, TaxSettings, CalculatedTotals } from '../types';

export const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const calculateTotals = (items: LineItem[], taxSettings: TaxSettings): CalculatedTotals => {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  const roundedSubtotal = round2(subtotal);

  // 1. No Tax Mode
  if (taxSettings.taxMode === 'no_tax') {
    return {
      subtotal: roundedSubtotal,
      taxMode: 'no_tax',
      nhil: 0,
      getfund: 0,
      taxableSubtotal: roundedSubtotal,
      vat: 0,
      flatVat: 0,
      grandTotal: roundedSubtotal,
    };
  }

  // 2. Flat VAT Scheme (Disables NHIL and GETFund completely)
  if (taxSettings.taxMode === 'flat_vat') {
    const flatVat = round2(roundedSubtotal * ((taxSettings.flatVatRate || 0) / 100));
    return {
      subtotal: roundedSubtotal,
      taxMode: 'flat_vat',
      nhil: 0,
      getfund: 0,
      taxableSubtotal: roundedSubtotal,
      vat: 0,
      flatVat,
      grandTotal: round2(roundedSubtotal + flatVat),
    };
  }

  // 3. Standard VAT + Levies Mode (NHIL 2.5% + GETFund 2.5% + Standard VAT 15%)
  const nhil = round2(roundedSubtotal * ((taxSettings.nhilRate || 0) / 100));
  const getfund = round2(roundedSubtotal * ((taxSettings.getfundRate || 0) / 100));
  const taxableSubtotal = round2(roundedSubtotal + nhil + getfund);

  const vat = taxSettings.calculationMode === 'gra_compound'
    ? round2(taxableSubtotal * ((taxSettings.vatRate || 0) / 100))
    : round2(roundedSubtotal * ((taxSettings.vatRate || 0) / 100));

  const grandTotal = round2(taxableSubtotal + vat);

  return {
    subtotal: roundedSubtotal,
    taxMode: 'standard_levies',
    nhil,
    getfund,
    taxableSubtotal,
    vat,
    flatVat: 0,
    grandTotal,
  };
};

export const formatMoney = (amount: number, currency: string = 'Ghc'): string => {
  const formatted = (amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
};
