import React from 'react';
import type { ReceiptDocument, CalculatedTotals } from '../../types';

interface ModernTemplateProps {
  document: ReceiptDocument;
  totals: CalculatedTotals;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ document: doc, totals }) => {
  return (
    <div className="w-full bg-white text-slate-800 p-8 font-sans leading-relaxed text-[13px] border border-slate-200 rounded-xl shadow-sm print:p-0 print:border-none print:shadow-none min-h-[980px] flex flex-col justify-between">
      <div>
        {/* Modern Accent Bar Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {doc.company.logoUrl ? (
              <img
                src={doc.company.logoUrl}
                alt={doc.company.name}
                className="h-16 max-w-44 object-contain"
              />
            ) : null}
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {doc.company.name}
              </h1>
              <p className="text-[11px] text-slate-500 max-w-md line-clamp-2">
                {doc.company.tagline}
              </p>
              <div className="flex gap-3 text-[11px] text-slate-600 mt-1">
                <span>{doc.company.location}</span>
                <span>•</span>
                <span>{doc.company.phone}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-indigo-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider">
              {doc.docType}
            </span>
            <div className="text-sm font-semibold text-slate-800 mt-2">
              #{doc.docNumber}
            </div>
            <div className="text-xs text-slate-500">{doc.date}</div>
          </div>
        </div>

        {/* Client & Metadata Info Cards */}
        <div className="grid grid-cols-2 gap-6 my-6">
          <div className="bg-slate-50 print:bg-transparent p-4 rounded-lg border border-slate-100 print:border-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Billed To
            </span>
            <div className="text-sm font-bold text-slate-900">{doc.client.name}</div>
            <div className="text-xs text-slate-600 mt-0.5">{doc.client.address}</div>
            <div className="text-xs text-slate-600">{doc.client.phone}</div>
            {doc.client.attn && (
              <div className="text-xs text-indigo-700 font-medium mt-1">
                Attn: {doc.client.attn}
              </div>
            )}
          </div>

          <div className="bg-slate-50 print:bg-transparent p-4 rounded-lg border border-slate-100 print:border-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Payment Information
            </span>
            <div className="text-xs text-slate-700">
              <span className="font-semibold">Terms:</span> {doc.terms || 'Due on Receipt'}
            </div>
            <div className="text-xs text-slate-700 mt-1">
              <span className="font-semibold">Bank:</span> {doc.company.bankBranch}
            </div>
            <div className="text-xs text-slate-700">
              <span className="font-semibold">Account:</span> {doc.company.bankAccount}
            </div>
          </div>
        </div>

        {/* Modern Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[12px]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 w-28 text-right">Price ({doc.currency})</th>
                <th className="py-2.5 px-3 w-32 text-right">Amount ({doc.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doc.items.map((item, index) => {
                const amount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <tr key={item.id || index} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{item.qty}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {(Number(item.unitPrice) || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-6 mt-6">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-600">{doc.company.paymentNotice}</p>
              {doc.notes && (
                <div className="mt-3 p-3 bg-amber-50 rounded text-xs text-amber-800 border border-amber-200">
                  {doc.notes}
                </div>
              )}
            </div>
            <div className="pt-8">
              <div className="w-48 border-b border-slate-300 pb-1 text-center text-xs text-slate-500">
                Authorized Signature
              </div>
            </div>
          </div>

          <div className="bg-slate-50 print:bg-transparent p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{totals.subtotal.toFixed(2)}</span>
            </div>

            {totals.taxMode === 'flat_vat' && (
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Flat VAT ({doc.taxSettings.flatVatRate}%)</span>
                <span>{totals.flatVat.toFixed(2)}</span>
              </div>
            )}

            {totals.taxMode === 'standard_levies' && (
              <>
                <div className="flex justify-between text-slate-500">
                  <span>NHIL ({doc.taxSettings.nhilRate}%)</span>
                  <span>{totals.nhil.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GETFUND ({doc.taxSettings.getfundRate}%)</span>
                  <span>{totals.getfund.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>VAT ({doc.taxSettings.vatRate}%)</span>
                  <span>{totals.vat.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-indigo-700">
              <span>Grand Total ({doc.currency})</span>
              <span>{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
