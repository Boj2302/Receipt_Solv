import React, { useState } from 'react';
import type { ClientInfo } from '../types';
import { X, UserPlus, Users, Check } from 'lucide-react';

interface ClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientInfo[];
  onSaveClient: (client: ClientInfo) => void;
  onApplyClient: (client: ClientInfo) => void;
}

export const ClientsModal: React.FC<ClientsModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSaveClient,
  onApplyClient,
}) => {
  const [newClient, setNewClient] = useState<ClientInfo>({
    name: '',
    address: '',
    phone: '',
    attn: '',
  });

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    onSaveClient(newClient);
    setNewClient({ name: '', address: '', phone: '', attn: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Frequent Clients Directory</h2>
              <p className="text-xs text-slate-500">
                Pre-saved clients for instant 1-click billing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Client Form */}
        <form onSubmit={handleAdd} className="p-4 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Add New Client
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              required
              placeholder="Client Name *"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className="py-1.5 px-2.5 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            />
            <input
              type="text"
              placeholder="Address / Location (e.g. Accra, Spintex)"
              value={newClient.address}
              onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              className="py-1.5 px-2.5 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Phone (e.g. 0560911457)"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className="py-1.5 px-2.5 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Attention (Attn:) person"
              value={newClient.attn}
              onChange={(e) => setNewClient({ ...newClient, attn: e.target.value })}
              className="py-1.5 px-2.5 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-2.5 flex justify-end">
            <button
              type="submit"
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md flex items-center gap-1 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Save Client
            </button>
          </div>
        </form>

        {/* Existing Clients List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {clients.map((c, idx) => (
            <div
              key={idx}
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors group"
            >
              <div>
                <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
                <div className="text-xs text-slate-500 flex gap-3 mt-0.5">
                  <span>📍 {c.address || 'No address'}</span>
                  <span>📞 {c.phone || 'No phone'}</span>
                  {c.attn && <span>👤 {c.attn}</span>}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApplyClient(c);
                  onClose();
                }}
                className="py-1 px-3 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 text-xs font-semibold rounded-md transition-all flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Use This Client
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
