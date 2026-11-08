import React from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Save,
  Clock,
  Users,
  Settings,
  PlusCircle,
  Smartphone,
  DownloadCloud,
} from 'lucide-react';

interface NavbarProps {
  onNew: () => void;
  onSave: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onOpenHistory: () => void;
  onOpenClients: () => void;
  onOpenSettings: () => void;
  onOpenMobile: () => void;
  canInstall?: boolean;
  onInstallApp?: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNew,
  onSave,
  onPrint,
  onExportPdf,
  onExportExcel,
  onOpenHistory,
  onOpenClients,
  onOpenSettings,
  onOpenMobile,
  canInstall,
  onInstallApp,
  historyCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-lg">
            WB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">
                ReceiptSolv
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Web Bishop Technology Receipt & Invoice Engine
            </p>
          </div>
        </div>

        {/* Center Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Create blank new receipt/invoice"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline">New</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View saved invoices history"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenClients}
            className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Manage frequent clients"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Clients</span>
          </button>

          {/* Connect Mobile Phone */}
          <button
            onClick={onOpenMobile}
            className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors cursor-pointer"
            title="Install or open on mobile phone"
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline font-bold">Install on Phone</span>
          </button>

          {/* Native Install Button when browser supports beforeinstallprompt */}
          {canInstall && (
            <button
              onClick={onInstallApp}
              className="animate-bounce flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm cursor-pointer"
              title="Install this app on your device"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Company branding & settings"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="hidden lg:inline">Settings</span>
          </button>
        </div>

        {/* Action Buttons: Save, Print, PDF, Excel */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSave}
            className="py-1.5 px-2.5 sm:px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Save changes to local history"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onExportExcel}
            className="py-1.5 px-2.5 sm:px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download Excel spreadsheet (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={onExportPdf}
            className="py-1.5 px-2.5 sm:px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download PDF document"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={onPrint}
            className="py-1.5 px-3 sm:px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </header>
  );
};
