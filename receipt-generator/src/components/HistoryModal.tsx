import React, { useState } from 'react';
import type { ReceiptDocument } from '../types';
import { calculateTotals } from '../utils/calculations';
import { exportToExcel } from '../utils/excelExport';
import { getTodayDateFormatted } from '../constants/defaultData';
import { incrementInvoiceNumber } from '../utils/storage';
import {
  X,
  Search,
  FileText,
  Copy,
  Trash2,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReceiptDocument[];
  onSelectDoc: (doc: ReceiptDocument) => void;
  onDeleteDoc: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectDoc,
  onDeleteDoc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = history.filter((doc) => {
    const term = searchTerm.toLowerCase();
    return (
      doc.client.name.toLowerCase().includes(term) ||
      doc.docNumber.toLowerCase().includes(term) ||
      doc.docType.toLowerCase().includes(term)
    );
  });

  const handleDuplicate = (doc: ReceiptDocument) => {
    const duplicated: ReceiptDocument = {
      ...doc,
      id: 'doc_' + Date.now(),
      docNumber: incrementInvoiceNumber(doc.docNumber),
      date: getTodayDateFormatted(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSelectDoc(duplicated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Saved Invoices & Receipts History
              </h2>
              <p className="text-xs text-slate-500">
                {history.length} saved document{history.length !== 1 ? 's' : ''} stored locally
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, invoice number, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No documents found</p>
              <p className="text-xs text-slate-400 mt-1">
                Save an invoice from the main screen to keep it here.
              </p>
            </div>
          ) : (
            filtered.map((doc) => {
              const totals = calculateTotals(doc.items, doc.taxSettings);
              return (
                <div
                  key={doc.id}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 truncate">
                        {doc.client.name || 'Unnamed Client'}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {doc.docType}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        #{doc.docNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>{doc.date}</span>
                      <span>•</span>
                      <span>{doc.items.length} item(s)</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">
                        {doc.currency} {totals.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={() => handleDuplicate(doc)}
                      title="Duplicate as next sequential document"
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => exportToExcel(doc)}
                      title="Export to Excel (.xlsx)"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete document #${doc.docNumber}?`)) {
                          onDeleteDoc(doc.id);
                        }
                      }}
                      title="Delete document"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectDoc(doc);
                        onClose();
                      }}
                      className="ml-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
