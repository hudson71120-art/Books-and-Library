import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, AlertCircle, CheckCircle, X } from 'lucide-react';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { signIn, signUp, validateMatchingEmails } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>(initialMode);

  // Form states
  const [username, setUsername] = useState('');
  const [bookClubEmail, setBookClubEmail] = useState('');
  const [libraryEmail, setLibraryEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Show / Hide password state (masked as *** by default)
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real-time mail match evaluation for signup and standard signin
  const isMatchValidationActive = mode === 'signup' || (mode === 'signin' && libraryEmail.length > 0);
  const mailValidationResult = isMatchValidationActive && bookClubEmail.length > 0 && libraryEmail.length > 0
    ? validateMatchingEmails(bookClubEmail, libraryEmail)
    : null;

  const handleQuickFillAdmin = () => {
    setMode('admin');
    setBookClubEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setLibraryEmail(ADMIN_EMAIL);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'admin') {
        const res = await signIn(ADMIN_EMAIL, password);
        if (res.success) {
          setSuccessMessage('Authenticated as Developer Admin.');
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.message);
        }
      } else if (mode === 'signin') {
        // Mail match check if library email provided
        if (libraryEmail.trim()) {
          const check = validateMatchingEmails(bookClubEmail, libraryEmail);
          if (!check.isValid) {
            setErrorMessage(check.message);
            setIsLoading(false);
            return;
          }
        }
        const res = await signIn(bookClubEmail, password, libraryEmail);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        // Sign-up
        if (!username.trim()) {
          setErrorMessage('Please provide a reader pseudonym or username.');
          setIsLoading(false);
          return;
        }

        // Strict Mail Validation requirement
        const matchCheck = validateMatchingEmails(bookClubEmail, libraryEmail);
        if (!matchCheck.isValid) {
          setErrorMessage(matchCheck.message);
          setIsLoading(false);
          return;
        }

        const res = await signUp(username, bookClubEmail, password, libraryEmail);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Security & Access</span>
            <h3 className="text-base font-serif font-bold text-stone-900">
              {mode === 'admin'
                ? 'Developer Admin Gateway'
                : mode === 'signup'
                ? 'Create Reader Account'
                : 'Reader Sign In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex gap-2 border-b border-stone-100 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`pb-2 font-medium border-b-2 transition-colors ${
              mode === 'signin'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`pb-2 font-medium border-b-2 transition-colors ${
              mode === 'signup'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setErrorMessage(null);
            }}
            className={`pb-2 font-medium border-b-2 transition-colors ml-auto flex items-center gap-1 ${
              mode === 'admin'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-amber-700/80 hover:text-amber-950'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Developer Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Reader Pseudonym / Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. AD2600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          )}

          {/* Book Club Email */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              {mode === 'admin' ? 'Authorized Admin Mail' : 'Book Club Mail'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={mode === 'admin'}
                placeholder="your.email@example.com"
                value={bookClubEmail}
                onChange={(e) => setBookClubEmail(e.target.value)}
                className="w-full px-3 py-2 pl-9 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 disabled:bg-stone-100 disabled:text-stone-600"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Library Mail (Mandatory Match Validation) */}
          {mode !== 'admin' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-stone-700">
                  Open Library Mail
                </label>
                <span className="text-[11px] text-stone-400">Must match Book Club Mail</span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  required={mode === 'signup'}
                  placeholder="Must match Book Club Mail"
                  value={libraryEmail}
                  onChange={(e) => setLibraryEmail(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Validation Status Indicator */}
              {mailValidationResult && (
                <div
                  className={`mt-1.5 p-2 rounded text-[11px] flex items-start gap-1.5 ${
                    mailValidationResult.isValid
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  {mailValidationResult.isValid ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <span>{mailValidationResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Password with Show/Hide toggle button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-stone-700">
                {mode === 'admin' ? 'Admin Master Password' : 'Password'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer font-medium"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide password</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show password</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={showPassword ? 'Enter password' : '••••••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pl-9 pr-10 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 font-mono"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Characters masked by default as ***. Click "Show password" to reveal.
            </p>
          </div>

          {/* Admin Fast Helper button for developer evaluation */}
          {mode === 'admin' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900">
              <p className="font-medium text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                Developer Admin Specification Credentials
              </p>
              <div className="mt-2 text-[11px] space-y-1 font-mono text-stone-700">
                <div>Mail: <span className="font-semibold text-stone-900">{ADMIN_EMAIL}</span></div>
                <div>Status: Developer Admin (Exclusive Insert/Update/Delete/Select)</div>
              </div>
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="mt-2.5 w-full py-1.5 text-xs font-medium text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded transition-colors"
              >
                Populate Admin Credentials
              </button>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 text-xs font-medium rounded transition-colors text-white cursor-pointer ${
              mode === 'admin'
                ? 'bg-amber-800 hover:bg-amber-900'
                : 'bg-stone-900 hover:bg-stone-800'
            }`}
          >
            {isLoading
              ? 'Authenticating...'
              : mode === 'admin'
              ? 'Authorize Developer Admin Access'
              : mode === 'signup'
              ? 'Complete Registration & Validation'
              : 'Sign In to Books & Friends'}
          </button>
        </form>
      </div>
    </div>
  );
};
