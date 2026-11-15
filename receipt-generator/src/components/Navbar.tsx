import React from 'react';
import type { AppUser, CloudSyncStatus } from '../types';
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
  Share2,
  Cloud,
  User,
  Archive,
} from 'lucide-react';

interface NavbarProps {
  onNew: () => void;
  onSave: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onOpenShare: () => void;
  onOpenHistory: () => void;
  onOpenClients: () => void;
  onOpenSettings: () => void;
  onOpenMobile: () => void;
  onOpenAuth: () => void;
  onOpenRecovery: () => void;
  canInstall?: boolean;
  onInstallApp?: () => void;
  historyCount: number;
  deletedCount: number;
  currentUser: AppUser | null;
  syncStatus: CloudSyncStatus;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNew,
  onSave,
  onPrint,
  onExportPdf,
  onExportExcel,
  onOpenShare,
  onOpenHistory,
  onOpenClients,
  onOpenSettings,
  onOpenMobile,
  onOpenAuth,
  onOpenRecovery,
  canInstall,
  onInstallApp,
  historyCount,
  deletedCount,
  currentUser,
  syncStatus,
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

          {/* Online Recovery Archive Shortcut */}
          <button
            onClick={onOpenRecovery}
            className="relative flex items-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Online Recovery & Deleted Trash"
          >
            <Archive className="w-4 h-4 text-amber-600" />
            <span className="hidden lg:inline">Recovery</span>
            {deletedCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full">
                {deletedCount}
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

          {/* Account & Multi-Device Sync Button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
              currentUser
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm'
            }`}
            title={
              currentUser
                ? `Signed in as ${currentUser.email} • Sync: ${syncStatus} • Click for details`
                : 'Sign in to sync across devices'
            }
          >
            {currentUser ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-400'
                        : syncStatus === 'syncing'
                        ? 'bg-blue-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-500'
                        : syncStatus === 'syncing'
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </span>
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline max-w-[100px] truncate font-bold">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">Sign In / Sync</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons: Save, Share, PDF, Excel, Print */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSave}
            className="py-1.5 px-2.5 sm:px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Save changes to local & cloud storage"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* SHARE BUTTON */}
          <button
            onClick={onOpenShare}
            className="py-1.5 px-2.5 sm:px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Share invoice to Bluetooth, WhatsApp, Email & social apps"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
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
