import React, { useState } from 'react';
import type { ReceiptDocument } from '../types';
import { calculateTotals, formatMoney } from '../utils/calculations';
import { generatePdfBlob } from '../utils/pdfExport';
import {
  X,
  Share2,
  Bluetooth,
  Send,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Radio,
  FileText,
  Info,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ReceiptDocument;
  onToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const totals = calculateTotals(doc.items, doc.taxSettings);
  const safeClient = doc.client.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Client';
  const fileName = `${doc.docType}_${safeClient}_${doc.docNumber}.pdf`;

  // Format clean, professional message for social apps & messaging
  const itemsSummary = doc.items
    .map((item) => `• ${item.description || 'Item'} (x${item.qty}) - ${doc.currency} ${(item.qty * item.unitPrice).toFixed(2)}`)
    .join('\n');

  const shareSummaryText = `📄 *${doc.company.name || 'WEB BISHOP TECHNOLOGY'}*
🧾 *${doc.docType} #${doc.docNumber}*
👤 *Client:* ${doc.client.name || 'Valued Client'}
📅 *Date:* ${doc.date}

📦 *Items:*
${itemsSummary}

💵 *Subtotal:* ${formatMoney(totals.subtotal, doc.currency)}
${totals.taxMode === 'flat_vat' ? `🏛️ *Flat VAT (${doc.taxSettings.flatVatRate}%):* ${formatMoney(totals.flatVat, doc.currency)}\n` : ''}${totals.taxMode === 'standard_levies' ? `🏛️ *Levies & VAT:* ${formatMoney(totals.nhil + totals.getfund + totals.vat, doc.currency)}\n` : ''}💰 *Grand Total:* ${formatMoney(totals.grandTotal, doc.currency)}

${doc.company.bankAccount ? `🏦 *Bank:* ${doc.company.bankBranch} | A/C: ${doc.company.bankAccount}\n` : ''}📞 *Phone:* ${doc.company.phone}
${doc.company.paymentNotice ? `\n📝 ${doc.company.paymentNotice}` : ''}
Generated via ReceiptSolv Pro`;

  const emailSubject = `${doc.company.name} - ${doc.docType} #${doc.docNumber} for ${doc.client.name}`;
  const emailBody = shareSummaryText;

  // 1. Share via Bluetooth / System Share (Web Share API with attached PDF file)
  const handleSystemShare = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfResult = await generatePdfBlob('receipt-document-content', fileName, (s) => onToast(s));

      if (navigator.share) {
        if (pdfResult && navigator.canShare && navigator.canShare({ files: [pdfResult.file] })) {
          await navigator.share({
            title: `${doc.docType} #${doc.docNumber} - ${doc.company.name}`,
            text: `${doc.docType} #${doc.docNumber} for ${doc.client.name} - Total: ${formatMoney(totals.grandTotal, doc.currency)}`,
            files: [pdfResult.file],
          });
          onToast('Shared successfully!');
          setIsGeneratingPdf(false);
          return;
        }

        // Fallback to text/URL share if files sharing is not supported by device
        await navigator.share({
          title: `${doc.docType} #${doc.docNumber}`,
          text: shareSummaryText,
          url: window.location.href,
        });
        onToast('Shared successfully!');
      } else {
        // Fallback when Web Share API is not available (e.g. desktop non-secure or older browser)
        await navigator.clipboard.writeText(shareSummaryText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        onToast('Summary copied to clipboard! (System share not supported on this browser)');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Sharing failed:', err);
        onToast('Share dialog closed or not supported.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Direct Web Bluetooth Connection (for thermal printers & BLE receivers)
  const handleBluetoothPair = async () => {
    if (!('bluetooth' in navigator)) {
      setBluetoothStatus('Web Bluetooth is not supported on this browser. Use "Send via Bluetooth / Share Sheet" below for standard file beaming.');
      return;
    }

    try {
      setBluetoothStatus('Scanning for nearby Bluetooth devices...');
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'battery_service'],
      });
      setBluetoothStatus(`Connected to: ${device.name || 'Bluetooth Device'}`);
      onToast(`Bluetooth device "${device.name || 'Device'}" selected!`);
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setBluetoothStatus('Bluetooth scan cancelled or no compatible device chosen.');
      } else {
        setBluetoothStatus('No Bluetooth device selected.');
      }
    }
  };

  // 3. Copy Summary
  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(shareSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onToast('Invoice summary copied to clipboard!');
    } catch {
      onToast('Could not copy to clipboard');
    }
  };

  // Social Links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareSummaryText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareSummaryText)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(shareSummaryText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${doc.docType} #${doc.docNumber} - Total ${formatMoney(totals.grandTotal, doc.currency)} via @ReceiptSolv`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Share {doc.docType} #{doc.docNumber}
              </h2>
              <p className="text-xs text-slate-500">
                Send to Bluetooth, WhatsApp, Email & social apps
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Main Primary Action: Bluetooth & System Share */}
          <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Bluetooth className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">
                    Bluetooth & System Share
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Beam PDF file wirelessly to nearby phones, PCs, or apps
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                Direct
              </span>
            </div>

            <button
              onClick={handleSystemShare}
              disabled={isGeneratingPdf}
              className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Preparing PDF File...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4 text-blue-600" />
                  <span>Share via Bluetooth / System Share</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </>
              )}
            </button>

            <div className="flex items-start gap-1.5 text-[11px] text-blue-100/90 bg-blue-800/40 p-2.5 rounded-xl border border-white/10">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-200" />
              <span>
                <strong>How to send via Bluetooth:</strong> Tap the button above. In your device's share menu, select <strong>Bluetooth</strong> (or <strong>Quick Share / AirDrop</strong>) and choose the receiving device.
              </span>
            </div>
          </div>

          {/* Social Media Apps Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>Send via Social Media & Apps</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 transition-all text-xs font-bold group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">WhatsApp</div>
                  <div className="text-[10px] text-emerald-600 font-normal">Direct Chat</div>
                </div>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-sky-200/90 bg-sky-50/70 hover:bg-sky-100/80 text-sky-800 transition-all text-xs font-bold group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">Telegram</div>
                  <div className="text-[10px] text-sky-600 font-normal">Message / Channel</div>
                </div>
              </a>

              {/* Email / Gmail */}
              <a
                href={mailtoUrl}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100/80 text-rose-800 transition-all text-xs font-bold group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">Email</div>
                  <div className="text-[10px] text-rose-600 font-normal">Draft with Breakdown</div>
                </div>
              </a>

              {/* SMS / Text Message */}
              <a
                href={smsUrl}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-indigo-200/90 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-800 transition-all text-xs font-bold group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">SMS</div>
                  <div className="text-[10px] text-indigo-600 font-normal">Phone Message</div>
                </div>
              </a>

              {/* X / Twitter */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all text-xs font-bold group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">X (Twitter)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Social Post</div>
                </div>
              </a>

              {/* Copy Summary Text */}
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all text-xs font-bold group cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs">{copied ? 'Copied!' : 'Copy Text'}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Clipboard Summary</div>
                </div>
              </button>
            </div>
          </div>

          {/* Web Bluetooth Device Connector */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>Pair Bluetooth Thermal Printer / BLE Device</span>
              </div>
              <button
                onClick={handleBluetoothPair}
                className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Scan Devices
              </button>
            </div>
            {bluetoothStatus && (
              <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-mono">
                {bluetoothStatus}
              </p>
            )}
          </div>

          {/* Summary Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Message Preview
              </span>
              <span className="text-[11px] text-slate-400">
                {doc.items.length} items • Total: {formatMoney(totals.grandTotal, doc.currency)}
              </span>
            </div>
            <pre className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl max-h-32 overflow-y-auto whitespace-pre-wrap font-sans">
              {shareSummaryText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleCopySummary}
            className="py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
