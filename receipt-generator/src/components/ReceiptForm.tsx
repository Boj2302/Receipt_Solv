import React, { useState } from 'react';
import type {
  ReceiptDocument,
  DocumentType,
  TemplateStyle,
  LineItem,
  ClientInfo,
  TaxMode,
} from '../types';
import {
  QUICK_SERVICES,
} from '../constants/defaultData';
import { incrementInvoiceNumber } from '../utils/storage';
import {
  Plus,
  Trash2,
  Sparkles,
  Percent,
  UserCheck,
  Lock,
} from 'lucide-react';

interface ReceiptFormProps {
  document: ReceiptDocument;
  onChange: (updated: ReceiptDocument) => void;
  savedClients: ClientInfo[];
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  document: doc,
  onChange,
  savedClients,
}) => {
  const [showQuickServices, setShowQuickServices] = useState(false);

  // Field update helpers
  const updateField = <K extends keyof ReceiptDocument>(key: K, value: ReceiptDocument[K]) => {
    onChange({ ...doc, [key]: value });
  };

  const updateClient = <K extends keyof ClientInfo>(key: K, value: ClientInfo[K]) => {
    onChange({
      ...doc,
      client: { ...doc.client, [key]: value },
    });
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    if (!selectedName) return;
    const found = savedClients.find((c) => c.name === selectedName);
    if (found) {
      onChange({
        ...doc,
        client: { ...found },
      });
    }
  };

  // Line item helpers
  const handleItemChange = (index: number, field: keyof LineItem, val: string | number) => {
    const newItems = [...doc.items];
    newItems[index] = {
      ...newItems[index],
      [field]: val,
    };
    onChange({ ...doc, items: newItems });
  };

  const addItem = (description: string = '', unitPrice: number = 0) => {
    const newItem: LineItem = {
      id: 'item_' + Date.now() + Math.random(),
      description,
      qty: 1,
      unitPrice,
    };
    onChange({ ...doc, items: [...doc.items, newItem] });
  };

  const removeItem = (index: number) => {
    if (doc.items.length <= 1) {
      alert('Must have at least one line item.');
      return;
    }
    const newItems = doc.items.filter((_, i) => i !== index);
    onChange({ ...doc, items: newItems });
  };

  // Sequential Invoice Number Increment
  const handleIncrementInvoiceNumber = () => {
    const next = incrementInvoiceNumber(doc.docNumber);
    updateField('docNumber', next);
  };

  // Tax Mode switch
  const handleTaxModeChange = (mode: TaxMode) => {
    onChange({
      ...doc,
      taxSettings: {
        ...doc.taxSettings,
        taxMode: mode,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* 1. Document Mode & Template Switcher */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Document Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['INVOICE', 'PROFORMA', 'RECEIPT'] as DocumentType[]).map((type) => {
            const isActive = doc.docType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => updateField('docType', type)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type === 'PROFORMA' ? 'PROFORMA INV.' : type}
              </button>
            );
          })}
        </div>

        {/* Template Style */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Template Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'classic', label: 'Classic (Web Bishop)' },
              { id: 'modern', label: 'Modern Executive' },
              { id: 'compact', label: 'Compact Slip' },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => updateField('templateStyle', tmpl.id as TemplateStyle)}
                className={`py-1.5 px-2 text-[11px] font-semibold rounded-md border text-center transition-all cursor-pointer ${
                  doc.templateStyle === tmpl.id
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-500 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Document Number, Date, Terms & Currency */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {doc.docType === 'INVOICE' ? 'Invoice No.' : doc.docType === 'RECEIPT' ? 'Receipt No.' : 'Proforma No.'}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={doc.docNumber}
              onChange={(e) => updateField('docNumber', e.target.value)}
              className="flex-1 text-xs font-mono font-bold py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              title="Next Sequential Number (+1)"
              onClick={handleIncrementInvoiceNumber}
              className="py-1 px-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-0.5 cursor-pointer flex-shrink-0"
            >
              +1
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Ordered sequential numbering</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
          <input
            type="text"
            value={doc.date}
            placeholder="DD/MM/YYYY"
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Terms</label>
          <input
            type="text"
            value={doc.terms}
            placeholder="e.g. Due on Receipt"
            onChange={(e) => updateField('terms', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
          <select
            value={doc.currency}
            onChange={(e) => updateField('currency', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium cursor-pointer"
          >
            <option value="Ghc">Ghc (Ghana Cedis)</option>
            <option value="GHS">GHS (Official)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
          </select>
        </div>
      </div>

      {/* 3. Client Information (Bill To) */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            Client Details (Bill To)
          </label>

          {/* Quick select saved client */}
          <select
            onChange={handleClientSelect}
            defaultValue=""
            className="text-xs py-1 px-2 border border-slate-300 rounded bg-slate-50 text-slate-700 hover:bg-white cursor-pointer"
          >
            <option value="" disabled>
              Load Frequent Client...
            </option>
            {savedClients.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.address || 'No Addr'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
              Client / Company Name
            </label>
            <input
              type="text"
              value={doc.client.name}
              placeholder="e.g. Royal Crown / Killpest Ltd"
              onChange={(e) => updateClient('name', e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
              Address / Location
            </label>
            <input
              type="text"
              value={doc.client.address}
              placeholder="e.g. Accra, Spintex, Tema"
              onChange={(e) => updateClient('address', e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Phone</label>
            <input
              type="text"
              value={doc.client.phone}
              placeholder="e.g. 0560911457"
              onChange={(e) => updateClient('phone', e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
              Attention (Attn:)
            </label>
            <input
              type="text"
              value={doc.client.attn}
              placeholder="e.g. Alexander Clerk / Mr David Ofori"
              onChange={(e) => updateClient('attn', e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Line Items Table */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Line Items ({doc.items.length})
          </label>
          <button
            type="button"
            onClick={() => setShowQuickServices(!showQuickServices)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showQuickServices ? 'Hide Quick Presets' : 'Quick Add Common Services'}
          </button>
        </div>

        {/* Quick Add Services Pills */}
        {showQuickServices && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg">
            <span className="text-[11px] font-bold text-indigo-900 block mb-2">
              Click any common service to add immediately:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SERVICES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addItem(s.description, s.unitPrice)}
                  className="text-[11px] py-1 px-2.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-md font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  + {s.description} ({doc.currency} {s.unitPrice})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items rows */}
        <div className="space-y-2">
          {doc.items.map((item, index) => {
            const amount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
            return (
              <div
                key={item.id}
                className="grid grid-cols-[30px_1fr_65px_95px_85px_30px] gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200"
              >
                <span className="text-xs font-bold text-slate-500 text-center">
                  {index + 1}
                </span>

                <input
                  type="text"
                  value={item.description}
                  placeholder="Item or repair description"
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full text-xs py-1 px-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.qty}
                  placeholder="Qty"
                  onChange={(e) => handleItemChange(index, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs py-1 px-1.5 text-center bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.unitPrice}
                  placeholder="Price"
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs py-1 px-1.5 text-right bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                />

                <span className="text-xs font-semibold text-slate-800 text-right pr-1">
                  {amount.toFixed(2)}
                </span>

                <button
                  type="button"
                  title="Remove item"
                  onClick={() => removeItem(index)}
                  className="text-slate-400 hover:text-red-600 transition-colors flex justify-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => addItem('', 0)}
          className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Blank Item Line
        </button>
      </div>

      {/* 5. Tax & Financial Calculation Options */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tax Regime & Levies
            </span>
          </div>
        </div>

        {/* 3 Tax Mode Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Mode 1: Standard Levies */}
          <button
            type="button"
            onClick={() => handleTaxModeChange('standard_levies')}
            className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer ${
              doc.taxSettings.taxMode === 'standard_levies'
                ? 'bg-blue-50 border-blue-500 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${doc.taxSettings.taxMode === 'standard_levies' ? 'text-blue-900' : 'text-slate-800'}`}>
                Standard Levies
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                NHIL + GETFund + VAT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              2.5% NHIL, 2.5% GETFund, 15% VAT
            </p>
          </button>

          {/* Mode 2: Flat VAT (Disables other taxes) */}
          <button
            type="button"
            onClick={() => handleTaxModeChange('flat_vat')}
            className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer ${
              doc.taxSettings.taxMode === 'flat_vat'
                ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${doc.taxSettings.taxMode === 'flat_vat' ? 'text-emerald-900' : 'text-slate-800'}`}>
                Flat Rate VAT
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Flat Scheme
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Disables other taxes; applies flat VAT only
            </p>
          </button>

          {/* Mode 3: No Tax */}
          <button
            type="button"
            onClick={() => handleTaxModeChange('no_tax')}
            className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer ${
              doc.taxSettings.taxMode === 'no_tax'
                ? 'bg-slate-100 border-slate-500 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${doc.taxSettings.taxMode === 'no_tax' ? 'text-slate-900' : 'text-slate-700'}`}>
                No Tax / Exempt
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                Flat Total
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Grand Total = Subtotal (Proforma)
            </p>
          </button>
        </div>

        {/* Detailed Tax Controls depending on active mode */}
        {doc.taxSettings.taxMode === 'flat_vat' && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                Flat Rate Scheme Configuration
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                NHIL & GETFund are disabled
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {/* Flat VAT Rate */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  Flat VAT Rate (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={doc.taxSettings.flatVatRate}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      taxSettings: {
                        ...doc.taxSettings,
                        flatVatRate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full py-1.5 px-2.5 text-xs border border-emerald-400 rounded-lg bg-white text-center font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Disabled NHIL display */}
              <div className="opacity-60">
                <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> NHIL (2.5%)
                </label>
                <div className="py-1.5 px-2 text-xs border border-dashed border-slate-300 rounded-lg bg-slate-100 text-center text-slate-400 font-medium">
                  Disabled
                </div>
              </div>

              {/* Disabled GETFund display */}
              <div className="opacity-60">
                <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> GETFund (2.5%)
                </label>
                <div className="py-1.5 px-2 text-xs border border-dashed border-slate-300 rounded-lg bg-slate-100 text-center text-slate-400 font-medium">
                  Disabled
                </div>
              </div>
            </div>
          </div>
        )}

        {doc.taxSettings.taxMode === 'standard_levies' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-3">
            <span className="text-xs font-bold text-blue-900 block">
              Standard Ghana GRA Levies Configuration
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  NHIL Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={doc.taxSettings.nhilRate}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      taxSettings: {
                        ...doc.taxSettings,
                        nhilRate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full py-1 px-2 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  GETFund Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={doc.taxSettings.getfundRate}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      taxSettings: {
                        ...doc.taxSettings,
                        getfundRate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full py-1 px-2 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  VAT Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={doc.taxSettings.vatRate}
                  onChange={(e) =>
                    onChange({
                      ...doc,
                      taxSettings: {
                        ...doc.taxSettings,
                        vatRate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full py-1 px-2 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
              <span className="font-semibold">Calculation standard:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="calcMode"
                  checked={doc.taxSettings.calculationMode === 'gra_compound'}
                  onChange={() =>
                    onChange({
                      ...doc,
                      taxSettings: {
                        ...doc.taxSettings,
                        calculationMode: 'gra_compound',
                      },
                    })
                  }
                />
                GRA Compound (VAT on Subtotal + Levies)
              </label>
              <label className="flex items-center gap-1 cursor-pointer ml-2">
                <input
                  type="radio"
                  name="calcMode"
                  checked={doc.taxSettings.calculationMode === 'flat'}
                  onChange={() =>
                    onChange({
                      ...doc,
                      taxSettings: {
                        ...doc.taxSettings,
                        calculationMode: 'flat',
                      },
                    })
                  }
                />
                Flat VAT on Subtotal
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 6. Notes & Authorization */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Notes / Warranty terms
          </label>
          <input
            type="text"
            value={doc.notes}
            placeholder="e.g. 3 months service warranty"
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Signature Line Text
          </label>
          <input
            type="text"
            value={doc.signatureText}
            placeholder="Signature:………………………………."
            onChange={(e) => updateField('signatureText', e.target.value)}
            className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
