import { useState, useEffect } from 'react';
import type {
  ReceiptDocument,
  ClientInfo,
  CompanyInfo,
  AppUser,
  CloudSyncStatus,
} from './types';
import {
  INITIAL_DOCUMENT,
  getTodayDateFormatted,
} from './constants/defaultData';
import {
  getHistory,
  saveToHistory,
  getDeletedHistory,
  softDeleteFromHistory,
  restoreFromDeleted,
  permanentDeleteFromDeleted,
  restoreAllFromDeleted,
  getSavedClients,
  saveClient,
  getSavedCompany,
  saveCompanyInfo,
  getNextOrderedInvoiceNumber,
  setNextInvoiceNumberSetting,
} from './utils/storage';
import {
  subscribeToAuth,
  subscribeToCloudDocuments,
  subscribeToUserSettings,
  syncDocumentToCloud,
  softDeleteDocumentInCloud,
  restoreDocumentInCloud,
  permanentDeleteDocumentInCloud,
  restoreAllDocumentsInCloud,
  syncCompanyToCloud,
  syncClientsToCloud,
  syncInvoiceCounterToCloud,
  migrateLocalDataToCloud,
  isFirebaseConfigured,
} from './utils/firebase';
import { exportToExcel } from './utils/excelExport';
import { exportToPdf, triggerPrint } from './utils/pdfExport';
import { Navbar } from './components/Navbar';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptPreview } from './components/ReceiptPreview';
import { HistoryModal } from './components/HistoryModal';
import { ClientsModal } from './components/ClientsModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileModal } from './components/MobileModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { RecoveryModal } from './components/RecoveryModal';
import {
  CheckCircle2,
  Eye,
  Edit3,
  Printer,
  Download,
  DownloadCloud,
  Share2,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function App() {
  const [document, setDocument] = useState<ReceiptDocument>(() => {
    const savedComp = getSavedCompany();
    const orderedNum = getNextOrderedInvoiceNumber();
    return {
      ...INITIAL_DOCUMENT,
      docNumber: orderedNum,
      company: savedComp,
    };
  });

  const [history, setHistory] = useState<ReceiptDocument[]>(() => getHistory());
  const [deletedHistory, setDeletedHistory] = useState<ReceiptDocument[]>(() => getDeletedHistory());
  const [clients, setClients] = useState<ClientInfo[]>(() => getSavedClients());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Cloud Sync
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() =>
    isFirebaseConfigured() ? 'offline' : 'local_only'
  );

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [shareTargetDoc, setShareTargetDoc] = useState<ReceiptDocument | null>(null);

  // PWA beforeinstallprompt event
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Mobile view toggle ('form' | 'preview')
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial local data and listen to auth changes
  useEffect(() => {
    // Auth listener
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`Signed in as ${user.displayName || user.email}`);
      }
    });

    // PWA install handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      unsubAuth();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Multi-Device Cloud Sync via Firestore when user is logged in
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_')) {
      return;
    }

    // Subscribe to user documents in cloud Firestore
    const unsubDocs = subscribeToCloudDocuments(
      currentUser.uid,
      (activeDocs) => {
        if (activeDocs.length > 0) {
          setHistory(activeDocs);
        }
        setSyncStatus('synced');
      },
      (deletedDocs) => {
        setDeletedHistory(deletedDocs);
        setSyncStatus('synced');
      },
      (err) => {
        console.error('Cloud sync error:', err);
        setSyncStatus('error');
      }
    );

    // Subscribe to user settings (company, clients, next counter)
    const unsubSettings = subscribeToUserSettings(
      currentUser.uid,
      (cloudCompany) => {
        saveCompanyInfo(cloudCompany);
        setDocument((prev) => ({ ...prev, company: cloudCompany }));
      },
      (cloudClients) => {
        setClients(cloudClients);
      },
      (nextCounter) => {
        setNextInvoiceNumberSetting(nextCounter);
      }
    );

    return () => {
      unsubDocs();
      unsubSettings();
    };
  }, [currentUser]);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('ReceiptSolv Pro installed to home screen!');
        setDeferredPrompt(null);
      }
    } else {
      setIsMobileOpen(true);
    }
  };

  // Create new blank document with next sequential number
  const handleNewDocument = () => {
    if (confirm('Start a new document? Unsaved changes will be lost.')) {
      const nextNum = getNextOrderedInvoiceNumber();
      const newDoc: ReceiptDocument = {
        ...INITIAL_DOCUMENT,
        id: 'doc_' + Date.now(),
        docNumber: nextNum,
        date: getTodayDateFormatted(),
        company: getSavedCompany(),
        items: [
          {
            id: 'item_1',
            description: '',
            qty: 1,
            unitPrice: 0,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDocument(newDoc);
      showToast(`Created new document #${nextNum}`);
    }
  };

  // Save current document (locally + cloud sync)
  const handleSaveDocument = async () => {
    const updatedHistory = saveToHistory(document);
    setHistory(updatedHistory);

    // Also save client if non-empty
    if (document.client.name.trim()) {
      const updatedClients = saveClient(document.client);
      setClients(updatedClients);
      if (currentUser && !currentUser.uid.startsWith('local_')) {
        syncClientsToCloud(currentUser.uid, updatedClients);
      }
    }

    // Cloud Sync to Firestore across devices
    if (currentUser && !currentUser.uid.startsWith('local_')) {
      setSyncStatus('syncing');
      const synced = await syncDocumentToCloud(currentUser.uid, document);
      setSyncStatus(synced ? 'synced' : 'offline');
      showToast(`Saved and synced ${document.docType} #${document.docNumber} across all devices!`);
    } else {
      showToast(`Saved ${document.docType} #${document.docNumber} locally!`);
    }
  };

  // Soft Delete from history (with online recovery preservation)
  const handleDeleteHistory = async (id: string) => {
    const res = softDeleteFromHistory(id);
    setHistory(res.active);
    setDeletedHistory(res.deleted);

    if (currentUser && !currentUser.uid.startsWith('local_')) {
      await softDeleteDocumentInCloud(currentUser.uid, id);
    }

    showToast('Document moved to Online Recovery Trash');
  };

  // Restore deleted document from online archive
  const handleRestoreDoc = async (id: string) => {
    const res = restoreFromDeleted(id);
    setHistory(res.active);
    setDeletedHistory(res.deleted);

    if (currentUser && !currentUser.uid.startsWith('local_')) {
      await restoreDocumentInCloud(currentUser.uid, id);
    }

    showToast('Invoice restored to active history!');
  };

  // Restore all deleted documents
  const handleRestoreAll = async () => {
    const res = restoreAllFromDeleted();
    setHistory(res.active);
    setDeletedHistory(res.deleted);

    if (currentUser && !currentUser.uid.startsWith('local_')) {
      await restoreAllDocumentsInCloud(currentUser.uid, deletedHistory);
    }

    showToast('All invoices restored successfully!');
  };

  // Permanent Delete
  const handlePermanentDelete = async (id: string) => {
    const updated = permanentDeleteFromDeleted(id);
    setDeletedHistory(updated);

    if (currentUser && !currentUser.uid.startsWith('local_')) {
      await permanentDeleteDocumentInCloud(currentUser.uid, id);
    }

    showToast('Document permanently removed.');
  };

  // Save Company settings (locally + cloud)
  const handleSaveCompany = (info: CompanyInfo) => {
    saveCompanyInfo(info);
    setDocument((prev) => ({ ...prev, company: info }));

    if (currentUser && !currentUser.uid.startsWith('local_')) {
      syncCompanyToCloud(currentUser.uid, info);
    }

    showToast('Company branding updated and synced!');
  };

  // Migrate local documents to cloud
  const handleMigrateToCloud = async () => {
    if (!currentUser || currentUser.uid.startsWith('local_')) {
      setIsAuthOpen(true);
      return;
    }

    const count = await migrateLocalDataToCloud(
      currentUser.uid,
      history,
      document.company,
      clients
    );
    showToast(`Backed up ${count} invoices to cloud!`);
  };

  // Open Share Modal (with either current document or specific past document)
  const handleOpenShare = (docToShare?: ReceiptDocument) => {
    setShareTargetDoc(docToShare || document);
    setIsShareOpen(true);
  };

  // Export handlers
  const handleExportPdf = async () => {
    const safeClient = document.client.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Client';
    const fileName = `${document.docType}_${safeClient}_${document.docNumber}.pdf`;
    showToast('Generating high-resolution PDF...');
    const success = await exportToPdf('receipt-document-content', fileName, (status) => showToast(status));
    if (!success) {
      showToast('Opening print dialog to Save as PDF...');
      triggerPrint();
    }
  };

  const handleExportExcel = () => {
    exportToExcel(document);
    showToast('Excel spreadsheet exported!');
  };

  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        onNew={handleNewDocument}
        onSave={handleSaveDocument}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        onOpenShare={() => handleOpenShare(document)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenClients={() => setIsClientsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMobile={() => setIsMobileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenRecovery={() => setIsRecoveryOpen(true)}
        canInstall={!!deferredPrompt}
        onInstallApp={handleTriggerInstall}
        historyCount={history.length}
        deletedCount={deletedHistory.length}
        currentUser={currentUser}
        syncStatus={syncStatus}
      />

      {/* Mobile Tab Selector & Quick Action Bar */}
      <div className="lg:hidden no-print sticky top-16 z-30 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex gap-1.5">
          <button
            onClick={() => setMobileTab('form')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              mobileTab === 'form'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Form
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              mobileTab === 'preview'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Live A4 Preview
          </button>
        </div>

        {/* Mobile quick actions */}
        <div className="flex items-center gap-1">
          {deferredPrompt && (
            <button
              onClick={handleTriggerInstall}
              className="p-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Install App"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile Share Button */}
          <button
            onClick={() => handleOpenShare(document)}
            className="p-1.5 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Share Invoice (Bluetooth, WhatsApp, Social)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportPdf}
            className="p-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handlePrint}
            className="py-1 px-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Print Receipt"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editor (5 cols on desktop) */}
          <div
            className={`lg:col-span-5 no-print space-y-4 ${
              mobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Document Editor
              </h2>
              <span className="text-[11px] text-slate-500">
                All changes update the preview live
              </span>
            </div>

            <ReceiptForm
              document={document}
              onChange={setDocument}
              savedClients={clients}
            />
          </div>

          {/* Right Column: Live A4 Preview (7 cols on desktop) */}
          <div
            className={`lg:col-span-7 print-container flex flex-col items-center ${
              mobileTab === 'form' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="no-print w-full flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Live A4 Document View
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenShare(document)}
                  className="py-1 px-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Share invoice"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Standard A4 Print
                </span>
              </div>
            </div>

            <ReceiptPreview document={document} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectDoc={setDocument}
        onDeleteDoc={handleDeleteHistory}
        onShareDoc={(doc) => handleOpenShare(doc)}
        onOpenRecovery={() => setIsRecoveryOpen(true)}
        deletedCount={deletedHistory.length}
      />

      <ClientsModal
        isOpen={isClientsOpen}
        onClose={() => setIsClientsOpen(false)}
        clients={clients}
        onSaveClient={(newClient) => {
          const updated = saveClient(newClient);
          setClients(updated);
          if (currentUser && !currentUser.uid.startsWith('local_')) {
            syncClientsToCloud(currentUser.uid, updated);
          }
          showToast(`Client "${newClient.name}" saved!`);
        }}
        onApplyClient={(selected) => {
          setDocument((prev) => ({ ...prev, client: selected }));
          showToast(`Loaded ${selected.name}`);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        company={document.company}
        onSaveCompany={handleSaveCompany}
        onUpdateNextDocNumber={(newNum) => {
          setNextInvoiceNumberSetting(newNum);
          setDocument((prev) => ({ ...prev, docNumber: newNum }));
          if (currentUser && !currentUser.uid.startsWith('local_')) {
            syncInvoiceCounterToCloud(currentUser.uid, newNum);
          }
          showToast(`Invoice counter set to #${newNum}`);
        }}
      />

      <MobileModal
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        defaultHostIp="192.168.100.150"
        canInstall={!!deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
      />

      {/* Share Modal (Bluetooth, WhatsApp, Email, Social) */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setShareTargetDoc(null);
        }}
        document={shareTargetDoc || document}
        onToast={showToast}
      />

      {/* Account Authentication & Multi-Device Sync Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        syncStatus={syncStatus}
        historyCount={history.length}
        onToast={showToast}
        onMigrateToCloud={handleMigrateToCloud}
      />

      {/* Online Recovery & Deleted Trash Modal */}
      <RecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        deletedHistory={deletedHistory}
        onRestoreDoc={handleRestoreDoc}
        onRestoreAll={handleRestoreAll}
        onPermanentDelete={handlePermanentDelete}
        onRefreshCloud={() => showToast('Cloud archive up to date!')}
        isCloudConnected={!!currentUser && !currentUser.uid.startsWith('local_')}
      />
    </div>
  );
}

export default App;
