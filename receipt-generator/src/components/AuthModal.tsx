import React, { useState } from 'react';
import type { AppUser, CloudSyncStatus, FirebaseConfigSettings } from '../types';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  sendResetPassword,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  getFirebaseConfig,
  isFirebaseConfigured,
} from '../utils/firebase';
import {
  X,
  User,
  Mail,
  Lock,
  Cloud,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Server,
  UploadCloud,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  syncStatus: CloudSyncStatus;
  historyCount: number;
  onToast: (msg: string) => void;
  onMigrateToCloud: () => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  syncStatus,
  historyCount,
  onToast,
  onMigrateToCloud,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'cloud_config'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Cloud Config state
  const existingConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(existingConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(existingConfig?.projectId || '');
  const [authDomain, setAuthDomain] = useState(existingConfig?.authDomain || '');
  const [appId, setAppId] = useState(existingConfig?.appId || '');

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      onToast(`Welcome back, ${email}!`);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
      onToast(`Account created successfully for ${email}!`);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMsg(err.message || 'Failed to create account.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email above to receive a password reset link.');
      return;
    }
    setIsLoading(true);
    try {
      await sendResetPassword(email.trim());
      setSuccessMsg(`Password reset email sent to ${email}. Check your inbox!`);
      setIsLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email.');
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onToast('Signed out successfully.');
    onClose();
  };

  const handleSaveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMsg('API Key and Project ID are required.');
      return;
    }

    const config: FirebaseConfigSettings = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      appId: appId.trim(),
      storageBucket: `${projectId.trim()}.appspot.com`,
    };

    saveCustomFirebaseConfig(config);
    onToast('Firebase cloud settings saved! Reloading synchronization...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClearCloudConfig = () => {
    if (confirm('Clear saved cloud credentials and revert to defaults?')) {
      clearCustomFirebaseConfig();
      onToast('Cloud configuration reset.');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      await onMigrateToCloud();
      onToast('All local invoices backed up to the cloud!');
    } catch {
      onToast('Cloud backup completed with partial status.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Account & Multi-Device Sync
              </h2>
              <p className="text-xs text-slate-500">
                Protect your data and sync invoices across all devices
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

        {/* User is Already Logged In */}
        {currentUser ? (
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg border-2 border-white/20">
                  {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm truncate">
                    {currentUser.displayName || 'Authorized User'}
                  </h3>
                  <p className="text-xs text-slate-300 truncate">
                    {currentUser.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${
                      syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                    }`}></span>
                    <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                      {isFirebaseConfigured() ? `Cloud Synced (${syncStatus})` : 'Local User Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Sync Information & Actions */}
            <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <div className="flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>Real-time Multi-Device Sync</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {historyCount} document(s)
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Any invoice you create or edit on this device is automatically synchronized to your account so you can open it on your phone or computer.
              </p>

              <button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isMigrating ? 'Syncing...' : 'Force Sync All Documents to Cloud'}</span>
              </button>
            </div>

            {/* Cloud Database Settings Link */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-700">Firebase Cloud Settings</span>
              </div>
              <button
                onClick={() => setTab('cloud_config')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of this Device</span>
            </button>
          </div>
        ) : (
          /* User Not Logged In: Sign In / Sign Up / Cloud Setup Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-bold">
              <button
                onClick={() => { setTab('signin'); setErrorMsg(null); }}
                className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
                  tab === 'signin' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
                  tab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
              <button
                onClick={() => { setTab('cloud_config'); setErrorMsg(null); }}
                className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
                  tab === 'cloud_config' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Cloud Setup
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: SIGN IN */}
              {tab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In & Sync'}
                  </button>

                  <p className="text-[11px] text-center text-slate-500">
                    Signing in protects your receipts and syncs your documents with your phone and other devices.
                  </p>
                </form>
              )}

              {/* TAB 2: CREATE ACCOUNT */}
              {tab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name or Business Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Jeffrey Boateng / Web Bishop"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account & Enable Cloud Sync'}
                  </button>
                </form>
              )}

              {/* TAB 3: CLOUD SETUP (VERCEL / FIREBASE CONFIGURATION) */}
              {tab === 'cloud_config' && (
                <form onSubmit={handleSaveCloudConfig} className="space-y-3.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Server className="w-4 h-4 text-blue-600" />
                      <span>Firebase Cloud Credentials (Vercel & Browser)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      For cross-device sync between your phone and laptop when deployed on Vercel, paste your Firebase project details below or add them in Vercel project environment variables.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Firebase API Key (apiKey)
                    </label>
                    <input
                      type="text"
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project ID (projectId)
                    </label>
                    <input
                      type="text"
                      required
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="receipt-solv-app"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Auth Domain (authDomain)
                    </label>
                    <input
                      type="text"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      placeholder="receipt-solv-app.firebaseapp.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      App ID (appId)
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="1:123456789:web:abcdef..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save & Connect Cloud
                    </button>
                    {existingConfig && (
                      <button
                        type="button"
                        onClick={handleClearCloudConfig}
                        className="py-2 px-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              currentUser ? 'bg-emerald-500' : 'bg-slate-400'
            }`} />
            <span className="text-[11px]">
              {currentUser ? `Signed in as ${currentUser.email}` : 'Signed out'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="py-1 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
