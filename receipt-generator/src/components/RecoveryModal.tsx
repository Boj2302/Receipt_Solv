import React, { useState } from 'react';
import type { ReceiptDocument } from '../types';
import { calculateTotals, formatMoney } from '../utils/calculations';
import {
  X,
  Search,
  RotateCcw,
  Trash2,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Archive,
} from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedHistory: ReceiptDocument[];
  onRestoreDoc: (docId: string) => void;
  onRestoreAll: () => void;
  onPermanentDelete: (docId: string) => void;
  onRefreshCloud?: () => void;
  isCloudConnected: boolean;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  deletedHistory,
  onRestoreDoc,
  onRestoreAll,
  onPermanentDelete,
  onRefreshCloud,
  isCloudConnected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRestoringAll, setIsRestoringAll] = useState(false);

  if (!isOpen) return null;

  const filtered = deletedHistory.filter((doc) => {
    const term = searchTerm.toLowerCase();
    return (
      doc.client.name.toLowerCase().includes(term) ||
      doc.docNumber.toLowerCase().includes(term) ||
      doc.docType.toLowerCase().includes(term)
    );
  });

  const handleRestoreAll = async () => {
    if (confirm(`Restore all ${deletedHistory.length} deleted document(s) back to active history?`)) {
      setIsRestoringAll(true);
      await onRestoreAll();
      setIsRestoringAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 text-amber-600 rounded-xl">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Online Recovery & Deleted Archive
                </h2>
                <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full flex items-center gap-1 ${
                  isCloudConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Cloud className="w-3 h-3" />
                  {isCloudConnected ? 'Cloud Protected' : 'Local Archive'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {deletedHistory.length} recoverable invoice{deletedHistory.length !== 1 ? 's' : ''} stored safely online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshCloud && (
              <button
                onClick={onRefreshCloud}
                title="Refresh latest cloud archive"
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cloud Recovery Notice */}
        <div className="p-3.5 bg-amber-50/80 border-b border-amber-200/60 text-xs text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Information Protection & Online Cloud Recovery</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Deleted invoices are never immediately destroyed. They are preserved in your cloud account so you can restore them on any device at any time.
              </p>
            </div>
          </div>

          {deletedHistory.length > 0 && (
            <button
              onClick={handleRestoreAll}
              disabled={isRestoringAll}
              className="shrink-0 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore All ({deletedHistory.length})</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter deleted invoices by client name, number, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/40" />
              <p className="text-sm font-semibold text-slate-600">No Deleted Invoices Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                All your documents are active. Any document deleted in the future will appear here for 1-click recovery.
              </p>
            </div>
          ) : (
            filtered.map((doc) => {
              const totals = calculateTotals(doc.items, doc.taxSettings);
              const formattedDeletedDate = doc.deletedAt
                ? new Date(doc.deletedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recently';

              return (
                <div
                  key={doc.id}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors group"
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

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>Doc Date: {doc.date}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">
                        {formatMoney(totals.grandTotal, doc.currency)}
                      </span>
                      <span>•</span>
                      <span className="text-amber-700 font-medium text-[11px] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                        Deleted: {formattedDeletedDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRestoreDoc(doc.id)}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      title="Restore invoice back to active history"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete invoice #${doc.docNumber}? This cannot be undone.`)) {
                          onPermanentDelete(doc.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Permanently remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {deletedHistory.length} item{deletedHistory.length !== 1 ? 's' : ''} in cloud trash
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
