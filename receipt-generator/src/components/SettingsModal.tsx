import React, { useState } from 'react';
import type { CompanyInfo } from '../types';
import { DEFAULT_COMPANY } from '../constants/defaultData';
import { getCurrentConfiguredNextNumber, setNextInvoiceNumberSetting } from '../utils/storage';
import { X, Building2, Upload, RotateCcw, Check, Hash } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyInfo;
  onSaveCompany: (info: CompanyInfo) => void;
  onUpdateNextDocNumber?: (nextNum: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  company,
  onSaveCompany,
  onUpdateNextDocNumber,
}) => {
  const [formData, setFormData] = useState<CompanyInfo>({ ...company });
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>(() => getCurrentConfiguredNextNumber());

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    if (confirm('Reset to original Web Bishop Technology Ltd settings?')) {
      setFormData({ ...DEFAULT_COMPANY });
      setNextInvoiceNumber('2026001');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(formData);
    if (nextInvoiceNumber.trim()) {
      setNextInvoiceNumberSetting(nextInvoiceNumber.trim());
      onUpdateNextDocNumber?.(nextInvoiceNumber.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Company & Branding Settings
              </h2>
              <p className="text-xs text-slate-500">
                Customize header details, sequential numbering, and banking info
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Sequential Invoice Number Setting */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Sequential Invoice Numbering Counter
              </label>
            </div>
            <p className="text-[11px] text-slate-600 mb-2">
              Next invoice number that will be assigned when creating new documents:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nextInvoiceNumber}
                onChange={(e) => setNextInvoiceNumber(e.target.value)}
                placeholder="e.g. 2026001 or 2026355"
                className="py-1.5 px-3 border border-blue-300 rounded-lg bg-white font-mono font-bold text-xs w-48 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500">
                Auto-increments sequentially (+1) with every document.
              </span>
            </div>
          </div>

          {/* Logo Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-24 h-16 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden p-1">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Company logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">No logo</span>
                )}
              </div>

              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs">
                  <Upload className="w-3.5 h-3.5" /> Upload New Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  PNG or JPG with transparent or light background recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Company Name & Tagline */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tagline / Description of Services
              </label>
              <textarea
                rows={2}
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Location & Digital Address
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Banking details */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Banking & Payment Instruction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bank Name & Branch
                </label>
                <input
                  type="text"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Disclaimer Notice
              </label>
              <input
                type="text"
                value={formData.paymentNotice}
                onChange={(e) => setFormData({ ...formData, paymentNotice: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Original Defaults
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
