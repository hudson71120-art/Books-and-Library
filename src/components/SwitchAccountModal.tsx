import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  RefreshCw,
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, demoProfiles, personalAccount, switchProfile, isAdmin } = useAuth();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !user) return null;

  const handleSwitch = (profileId: string) => {
    const res = switchProfile(profileId);
    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-stone-700" />
              <span>Section 8.3: Switch Reader Account</span>
            </span>
            <h3 className="text-base font-serif font-bold text-stone-900 mt-0.5">
              Switch Reader Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {feedback && (
            <div
              className={`p-3 rounded flex items-start gap-2 ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Current Profile Card */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
              Currently Active Account
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-stone-300 bg-stone-200 object-cover"
                />
                <div>
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <span>{user.username}</span>
                    {user.isDemo && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded">
                        Demo Profile
                      </span>
                    )}
                    {isAdmin && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                        Admin Owner
                      </span>
                    )}
                    {!user.isDemo && !isAdmin && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                        Personal Account
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500">{user.bookClubEmail}</div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">Active</span>
            </div>
          </div>

          {/* Strict Switching Rule Explanation (Specification Section 8.3) */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-950 font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5 text-amber-800" />
              <span>Account Switching Restrictions</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              When using <strong>Switch Reader Account</strong>, users are only permitted to switch to <strong>Demo accounts</strong>. Switching to other users' personal accounts is strictly prohibited. Users may only switch between their own personal account and Demo accounts; other users' accounts cannot be accessed or switched to in this manner.
            </p>
          </div>

          {/* Permitted Demo Accounts List */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block mb-2">
              Permitted Demo Accounts
            </span>
            <div className="space-y-2">
              {demoProfiles.map((dp) => {
                const isCurrent = user.id === dp.id;
                return (
                  <div
                    key={dp.id}
                    className={`p-3 rounded border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'border-stone-900 bg-stone-50/90 ring-1 ring-stone-900/10'
                        : 'border-stone-200 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={dp.avatarUrl}
                        alt={dp.username}
                        className="w-8 h-8 rounded-full border border-stone-300 bg-stone-100 object-cover"
                      />
                      <div>
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <span>{dp.username}</span>
                          <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                            Demo Profile
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">{dp.bookClubEmail}</div>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="text-[11px] font-medium text-stone-500">Current</span>
                    ) : (
                      <button
                        onClick={() => handleSwitch(dp.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded font-medium transition-colors cursor-pointer"
                      >
                        <span>Switch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User's Own Personal Account (if stored and currently on a demo profile) */}
          {personalAccount && user.id !== personalAccount.id && (
            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block mb-2">
                Your Personal Account
              </span>
              <div className="p-3 rounded border border-emerald-300 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={personalAccount.avatarUrl}
                    alt={personalAccount.username}
                    className="w-8 h-8 rounded-full border border-emerald-300 bg-white object-cover"
                  />
                  <div>
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span>{personalAccount.username}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Your Personal Account
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      {personalAccount.bookClubEmail}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSwitch(personalAccount.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded font-medium transition-colors cursor-pointer"
                >
                  <span>Return to Personal</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Prohibited Accounts / Boundary Notice */}
          <div className="p-3 rounded bg-stone-100/70 border border-stone-200 text-stone-500 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              Other users' personal accounts and Developer Admin are locked and isolated by Supabase RBAC policies.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
