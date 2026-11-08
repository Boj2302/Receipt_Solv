import * as XLSX from 'xlsx';
import type { ReceiptDocument } from '../types';
import { calculateTotals } from './calculations';

export const exportToExcel = (doc: ReceiptDocument) => {
  const totals = calculateTotals(doc.items, doc.taxSettings);
  
  // Create an empty worksheet
  const ws: XLSX.WorkSheet = {};
  
  // Helper to set cell value
  const setCell = (cellRef: string, val: string | number | null, formula?: string) => {
    if (formula) {
      ws[cellRef] = { t: 'n', f: formula };
    } else if (typeof val === 'number') {
      ws[cellRef] = { t: 'n', v: val };
    } else if (val !== null && val !== undefined) {
      ws[cellRef] = { t: 's', v: String(val) };
    }
  };

  // 1. Header Information
  setCell('D2', doc.company.name);
  setCell('D4', `${doc.company.tagline}    ${doc.company.location} ${doc.company.phone}`);

  // 2. Billing & Metadata
  setCell('A11', 'BILL TO:');
  setCell('G11', 'Date:');
  setCell('H11', doc.date);

  setCell('A12', 'Name:');
  setCell('B12', doc.client.name);
  setCell('G12', `${doc.docType === 'INVOICE' ? 'Invoice No:' : doc.docType === 'RECEIPT' ? 'Receipt No:' : 'Proforma No:'}`);
  setCell('I12', doc.docNumber);

  setCell('A13', 'Address:');
  setCell('B13', doc.client.address);
  setCell('G13', 'Terms:');
  setCell('I13', doc.terms || 'Due on Receipt');

  setCell('A14', 'Phone:');
  setCell('B14', doc.client.phone);

  setCell('A15', 'Attn:');
  setCell('B15', doc.client.attn);

  // Document Title Banner
  setCell('B16', doc.docType);

  // 3. Table Header
  setCell('A18', 'S/N');
  setCell('B18', 'Description');
  setCell('G18', 'Qty');
  setCell('H18', `Unit Price (${doc.currency})`);
  setCell('I18', `Amount (${doc.currency})`);

  // 4. Line Items (Starting at row 19, up to row 30)
  const startRow = 19;
  doc.items.forEach((item, index) => {
    const row = startRow + index;
    setCell(`A${row}`, index + 1);
    setCell(`B${row}`, item.description);
    setCell(`G${row}`, Number(item.qty));
    setCell(`H${row}`, Number(item.unitPrice));
    setCell(`I${row}`, Number(item.qty) * Number(item.unitPrice));
  });

  // 5. Summary & Taxes
  const subtotalRow = 31;
  setCell(`G${subtotalRow}`, 'Subtotal');
  setCell(`I${subtotalRow}`, totals.subtotal);

  // Payment disclaimer
  setCell('A32', `${doc.company.paymentNotice}\nAcc No: ${doc.company.bankAccount} | ${doc.company.bankBranch}`);

  if (doc.taxSettings.taxMode === 'flat_vat') {
    // Flat VAT scheme: only Flat VAT is applied; other taxes disabled
    setCell('G32', `Flat VAT (${doc.taxSettings.flatVatRate}%)`);
    setCell('I32', totals.flatVat);
  } else if (doc.taxSettings.taxMode === 'standard_levies') {
    setCell('G32', `NHIL (${doc.taxSettings.nhilRate}%)`);
    setCell('I32', totals.nhil);

    setCell('G33', `GETFUND (${doc.taxSettings.getfundRate}%)`);
    setCell('I33', totals.getfund);

    setCell('G34', `Taxable Base`);
    setCell('I34', totals.taxableSubtotal);

    setCell('G35', `VAT (${doc.taxSettings.vatRate}%)`);
    setCell('I35', totals.vat);
  }

  setCell('A37', doc.signatureText);
  setCell('G37', 'Grand Total');
  setCell('I37', totals.grandTotal);

  // Merged cell configuration matching template
  ws['!merges'] = [
    { s: { r: 1, c: 3 }, e: { r: 2, c: 8 } }, // D2:I3
    { s: { r: 3, c: 3 }, e: { r: 6, c: 8 } }, // D4:I7
    { s: { r: 10, c: 7 }, e: { r: 10, c: 8 } }, // H11:I11
    { s: { r: 11, c: 1 }, e: { r: 11, c: 2 } }, // B12:C12
    { s: { r: 12, c: 1 }, e: { r: 12, c: 2 } }, // B13:C13
    { s: { r: 13, c: 1 }, e: { r: 13, c: 2 } }, // B14:C14
    { s: { r: 14, c: 1 }, e: { r: 14, c: 2 } }, // B15:C15
    { s: { r: 15, c: 1 }, e: { r: 16, c: 5 } }, // B16:F17
    { s: { r: 17, c: 1 }, e: { r: 17, c: 5 } }, // B18:F18
    { s: { r: 30, c: 6 }, e: { r: 30, c: 7 } }, // G31:H31
    { s: { r: 31, c: 0 }, e: { r: 33, c: 4 } }, // A32:E34
    { s: { r: 31, c: 6 }, e: { r: 31, c: 7 } }, // G32:H32
    { s: { r: 32, c: 6 }, e: { r: 32, c: 7 } }, // G33:H33
    { s: { r: 33, c: 6 }, e: { r: 33, c: 7 } }, // G34:H34
    { s: { r: 34, c: 6 }, e: { r: 34, c: 7 } }, // G35:H35
    { s: { r: 36, c: 0 }, e: { r: 36, c: 2 } }, // A37:C37
    { s: { r: 36, c: 6 }, e: { r: 36, c: 7 } }, // G37:H37
  ];

  // Merge description cells for each line item (Col B to F)
  doc.items.forEach((_, idx) => {
    const row = startRow + idx - 1; // 0-indexed row
    ws['!merges']!.push({
      s: { r: row, c: 1 },
      e: { r: row, c: 5 },
    });
  });

  // Column widths matching original template
  ws['!cols'] = [
    { wch: 10 }, // A
    { wch: 12 }, // B
    { wch: 12 }, // C
    { wch: 12 }, // D
    { wch: 12 }, // E
    { wch: 12 }, // F
    { wch: 10 }, // G
    { wch: 18 }, // H
    { wch: 18 }, // I
  ];

  // Set worksheet bounds
  ws['!ref'] = 'A1:I40';

  // Create workbook and write file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet2');

  const safeClient = doc.client.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Client';
  const fileName = `${doc.docType}_${safeClient}_${doc.docNumber}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
