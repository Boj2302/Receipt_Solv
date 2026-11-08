import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Wifi, QrCode, Copy, Check, DownloadCloud, Globe } from 'lucide-react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHostIp?: string;
  onTriggerInstall?: () => void;
  canInstall?: boolean;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  defaultHostIp = '192.168.100.150',
  onTriggerInstall,
  canInstall,
}) => {
  const [ipAddress, setIpAddress] = useState(defaultHostIp);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const port = '5173';
  const networkUrl = `http://${ipAddress}:${port}`;

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(networkUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [isOpen, networkUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(networkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Install on Your Mobile Phone</h2>
              <p className="text-xs text-slate-500">
                Install as a native standalone app on Android & iPhone
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Native Install Button if browser triggered it */}
          {canInstall && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Install Available Now!</h4>
                <p className="text-[11px] text-emerald-700">Install ReceiptSolv directly to this device's home screen.</p>
              </div>
              <button
                type="button"
                onClick={onTriggerInstall}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <DownloadCloud className="w-4 h-4" /> Install Now
              </button>
            </div>
          )}

          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="bg-white p-3 rounded-lg shadow-xs border border-slate-200">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Scan with phone"
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                  <QrCode className="w-10 h-10 animate-pulse" />
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-800 mt-3 text-center">
              1. Scan this QR code with your phone camera
            </p>
            <p className="text-[11px] text-slate-500 text-center mt-0.5">
              Make sure phone is connected to the same Wi-Fi
            </p>
          </div>

          {/* Direct URL */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Direct Phone Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 select-all">
                <Wifi className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                <span className="truncate">{networkUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">Custom IP (if network changed):</span>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value.trim())}
                className="py-1 px-2 border border-slate-300 rounded font-mono text-xs w-36 bg-white text-slate-800"
                placeholder="192.168.100.150"
              />
            </div>
          </div>

          {/* Mobile Phone Installation Guide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Android Instructions */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>🤖</span> Android (Chrome / Samsung)
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Open the link above in Chrome.</li>
                <li>Tap the <strong>three dots menu (⋮)</strong> top-right.</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>The <strong>ReceiptSolv Pro</strong> icon will appear on your phone's app list!</li>
              </ol>
            </div>

            {/* iPhone / iOS Instructions */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>🍎</span> iPhone / iPad (Safari)
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Open the link in <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share button</strong> (square with arrow ↑).</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>"Add"</strong>. It opens like a full native iOS app without browser bars!</li>
              </ol>
            </div>
          </div>

          {/* Cloud Hosting Note for Anywhere-Access */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <Globe className="w-4 h-4 text-amber-700" /> Want to use it anywhere outside your Wi-Fi?
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              You can deploy this folder for free to <strong>Vercel</strong> or <strong>Netlify</strong>. This gives you a permanent link (e.g. <code>https://webbishop-receipts.vercel.app</code>) that anyone on your team can install onto their phones anywhere in the world!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
