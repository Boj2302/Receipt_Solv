import React from 'react';
import type { ReceiptDocument, CalculatedTotals } from '../../types';

interface ClassicTemplateProps {
  document: ReceiptDocument;
  totals: CalculatedTotals;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ document: doc, totals }) => {
  // Ensure we show at least 8 rows in the table for visual balance matching the original paper
  const minRows = 8;
  const emptyRowsCount = Math.max(0, minRows - doc.items.length);
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => i + doc.items.length + 1);

  return (
    <div className="w-full bg-white text-black p-8 font-sans leading-relaxed text-[13px] border border-gray-200 shadow-sm print:p-0 print:border-none print:shadow-none min-h-[980px] flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4 mb-4">
          {/* Logo */}
          <div className="w-44 flex-shrink-0 flex items-center justify-center">
            {doc.company.logoUrl ? (
              <img
                src={doc.company.logoUrl}
                alt={doc.company.name}
                className="max-h-24 max-w-full object-contain"
              />
            ) : (
              <div className="text-xl font-bold tracking-wider text-gray-700">
                {doc.company.name.split(' ')[0]}
              </div>
            )}
          </div>

          {/* Company Details */}
          <div className="flex-1 pl-6 text-center">
            <h1 className="text-lg font-bold uppercase tracking-wide text-gray-900 mb-1">
              {doc.company.name}
            </h1>
            <p className="text-[11px] text-gray-700 max-w-xl mx-auto leading-normal font-medium mb-1">
              {doc.company.tagline}
            </p>
            <p className="text-[11px] text-gray-800 font-semibold">
              {doc.company.location} &nbsp;|&nbsp; {doc.company.phone}
            </p>
          </div>
        </div>

        {/* Bill To & Invoice Info */}
        <div className="grid grid-cols-2 gap-4 mb-3 text-[12px]">
          {/* Left: Bill To */}
          <div className="space-y-0.5">
            <div className="font-bold text-gray-900 mb-1 tracking-wider">BILL TO:</div>
            <div className="grid grid-cols-[60px_1fr] gap-1">
              <span className="font-semibold text-gray-700">Name:</span>
              <span className="font-medium text-gray-900">{doc.client.name || '—'}</span>
            </div>
            <div className="grid grid-cols-[60px_1fr] gap-1">
              <span className="font-semibold text-gray-700">Address:</span>
              <span className="text-gray-800">{doc.client.address || '—'}</span>
            </div>
            <div className="grid grid-cols-[60px_1fr] gap-1">
              <span className="font-semibold text-gray-700">Phone:</span>
              <span className="text-gray-800">{doc.client.phone || '—'}</span>
            </div>
            <div className="grid grid-cols-[60px_1fr] gap-1">
              <span className="font-semibold text-gray-700">Attn:</span>
              <span className="text-gray-800">{doc.client.attn || '—'}</span>
            </div>
          </div>

          {/* Right: Metadata */}
          <div className="space-y-0.5 pl-6">
            <div className="grid grid-cols-[90px_1fr] gap-1">
              <span className="font-semibold text-gray-700">Date:</span>
              <span className="font-bold text-gray-900">{doc.date}</span>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-1">
              <span className="font-semibold text-gray-700">
                {doc.docType === 'INVOICE' ? 'Invoice No:' : doc.docType === 'RECEIPT' ? 'Receipt No:' : 'Proforma No:'}
              </span>
              <span className="font-bold text-gray-900">{doc.docNumber}</span>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-1">
              <span className="font-semibold text-gray-700">Terms:</span>
              <span className="text-gray-800">{doc.terms || '—'}</span>
            </div>
          </div>
        </div>

        {/* Document Type Center Title */}
        <div className="text-center my-3">
          <span className="inline-block text-base font-extrabold uppercase tracking-widest px-6 py-1 border-y border-gray-400">
            {doc.docType === 'PROFORMA' ? 'PROFORMA INVOICE' : doc.docType}
          </span>
        </div>

        {/* Table of Line Items */}
        <div className="border border-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black text-center font-bold text-[12px] bg-gray-50 print:bg-transparent">
                <th className="w-12 py-2 px-2 border-r border-black">S/N</th>
                <th className="py-2 px-3 border-r border-black text-left">Description</th>
                <th className="w-16 py-2 px-2 border-r border-black">Qty</th>
                <th className="w-28 py-2 px-2 border-r border-black text-right">
                  Unit Price ({doc.currency})
                </th>
                <th className="w-32 py-2 px-2 text-right">
                  Amount ({doc.currency})
                </th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, index) => {
                const amount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <tr key={item.id || index} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-center border-r border-black font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-black font-normal text-gray-900">
                      {item.description}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-black">
                      {item.qty}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-black">
                      {(Number(item.unitPrice) || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {amount.toLocaleString('en-US', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}

              {/* Empty padding rows to maintain authentic template height */}
              {emptyRows.map((sn) => (
                <tr key={`empty-${sn}`} className="border-b border-gray-100 h-7">
                  <td className="py-1 px-2 text-center border-r border-black text-gray-300 text-[11px]">
                    {sn}
                  </td>
                  <td className="py-1 px-3 border-r border-black"></td>
                  <td className="py-1 px-2 border-r border-black"></td>
                  <td className="py-1 px-2 border-r border-black"></td>
                  <td className="py-1 px-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Calculations & Notes Grid */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-4 mt-2">
          {/* Bottom Left: Bank Info & Payment Notice */}
          <div className="flex flex-col justify-between pt-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-800 leading-snug">
                {doc.company.paymentNotice}
              </p>
              <div className="mt-2 text-[11px] text-gray-700 bg-gray-50 print:bg-transparent p-2 border border-gray-200 print:border-none print:p-0">
                <span className="font-bold">Acc No:</span> {doc.company.bankAccount}
                <br />
                <span className="font-bold">Branch:</span> {doc.company.bankBranch}
              </div>

              {doc.notes && (
                <p className="mt-2 text-[11px] text-gray-600 italic">
                  Note: {doc.notes}
                </p>
              )}
            </div>

            <div className="mt-8">
              <p className="text-[12px] font-medium text-gray-800">
                {doc.signatureText || 'Signature:……………………………….'}
              </p>
            </div>
          </div>

          {/* Bottom Right: Financial Totals Breakdown */}
          <div className="border border-black text-[12px]">
            {/* Subtotal */}
            <div className="flex justify-between py-1.5 px-3 border-b border-black font-semibold">
              <span>Subtotal</span>
              <span>
                {totals.subtotal.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Flat VAT Scheme (Disables other taxes) */}
            {totals.taxMode === 'flat_vat' && (
              <div className="flex justify-between py-1.5 px-3 border-b border-black">
                <span>Flat VAT ({doc.taxSettings.flatVatRate}%)</span>
                <span>
                  {totals.flatVat.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {/* Standard GRA Levies Scheme */}
            {totals.taxMode === 'standard_levies' && (
              <>
                <div className="flex justify-between py-1 px-3 border-b border-gray-300">
                  <span>NHIL ({doc.taxSettings.nhilRate}%)</span>
                  <span>
                    {totals.nhil.toLocaleString('en-US', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between py-1 px-3 border-b border-black">
                  <span>GETFUND ({doc.taxSettings.getfundRate}%)</span>
                  <span>
                    {totals.getfund.toLocaleString('en-US', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between py-1 px-3 border-b border-black font-semibold bg-gray-50 print:bg-transparent">
                  <span>Taxable Base</span>
                  <span>
                    {totals.taxableSubtotal.toLocaleString('en-US', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between py-1 px-3 border-b border-black">
                  <span>VAT ({doc.taxSettings.vatRate}%)</span>
                  <span>
                    {totals.vat.toLocaleString('en-US', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </>
            )}

            {/* Grand Total */}
            <div className="flex justify-between py-2 px-3 bg-gray-100 print:bg-transparent font-bold text-[13px] border-t-2 border-black">
              <span>Grand Total ({doc.currency})</span>
              <span>
                {totals.grandTotal.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
