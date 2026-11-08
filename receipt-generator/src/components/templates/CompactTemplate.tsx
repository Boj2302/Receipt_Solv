import React from 'react';
import type { ReceiptDocument, CalculatedTotals } from '../../types';

interface CompactTemplateProps {
  document: ReceiptDocument;
  totals: CalculatedTotals;
}

export const CompactTemplate: React.FC<CompactTemplateProps> = ({ document: doc, totals }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white text-gray-900 p-6 font-mono text-[12px] border border-dashed border-gray-300 shadow-sm print:border-none print:shadow-none min-h-[700px] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="text-center pb-4 border-b border-dashed border-gray-400">
          {doc.company.logoUrl && (
            <img
              src={doc.company.logoUrl}
              alt={doc.company.name}
              className="h-12 max-w-32 mx-auto object-contain mb-2"
            />
          )}
          <h1 className="font-bold text-sm uppercase">{doc.company.name}</h1>
          <p className="text-[10px] text-gray-600 mt-0.5">{doc.company.location}</p>
          <p className="text-[10px] text-gray-600">{doc.company.phone}</p>
        </div>

        {/* Info */}
        <div className="py-3 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
          <div className="flex justify-between font-bold">
            <span>TYPE: {doc.docType}</span>
            <span>NO: {doc.docNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>DATE: {doc.date}</span>
            <span>TERMS: {doc.terms || 'N/A'}</span>
          </div>
          <div className="pt-1">
            <span className="font-bold">CLIENT: </span>
            <span>{doc.client.name}</span>
            {doc.client.phone && <span> ({doc.client.phone})</span>}
          </div>
        </div>

        {/* Table */}
        <div className="py-3">
          <div className="flex justify-between font-bold border-b border-black pb-1 mb-2 text-[11px]">
            <span className="w-8">QTY</span>
            <span className="flex-1 px-2">ITEM</span>
            <span className="w-20 text-right">TOTAL</span>
          </div>
          <div className="space-y-1.5">
            {doc.items.map((item, index) => {
              const amount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
              return (
                <div key={item.id || index} className="flex justify-between items-start text-[11px]">
                  <span className="w-8">{item.qty}x</span>
                  <div className="flex-1 px-2">
                    <div>{item.description}</div>
                    <div className="text-[10px] text-gray-500">
                      @{Number(item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  <span className="w-20 text-right font-medium">
                    {amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-3 border-t border-dashed border-gray-400 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>{doc.currency} {totals.subtotal.toFixed(2)}</span>
          </div>

          {totals.taxMode === 'flat_vat' && (
            <div className="flex justify-between text-gray-700 font-bold">
              <span>FLAT VAT ({doc.taxSettings.flatVatRate}%):</span>
              <span>{totals.flatVat.toFixed(2)}</span>
            </div>
          )}

          {totals.taxMode === 'standard_levies' && (
            <>
              <div className="flex justify-between text-gray-600">
                <span>NHIL ({doc.taxSettings.nhilRate}%):</span>
                <span>{totals.nhil.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GETFUND ({doc.taxSettings.getfundRate}%):</span>
                <span>{totals.getfund.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT ({doc.taxSettings.vatRate}%):</span>
                <span>{totals.vat.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between font-bold text-sm pt-2 border-t border-black">
            <span>TOTAL:</span>
            <span>{doc.currency} {totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 text-center text-[10px] text-gray-600 border-t border-dashed border-gray-400 mt-6">
        <p className="font-semibold">{doc.company.paymentNotice}</p>
        <p className="mt-1">Bank: {doc.company.bankBranch}</p>
        <p>A/C: {doc.company.bankAccount}</p>
        <p className="mt-3 font-mono font-bold tracking-widest">*** THANK YOU FOR YOUR BUSINESS ***</p>
      </div>
    </div>
  );
};
