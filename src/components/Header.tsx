import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, BookOpen, ChevronDown, CheckCircle, LogOut, RefreshCw, FolderArchive } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
  onOpenProfile: () => void;
  onOpenSwitchAccount: () => void;
  onOpenLibrary: () => void;
  onScrollToPipeline: () => void;
  onOpenExportZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenSwitchAccount,
  onOpenLibrary,
  onScrollToPipeline,
  onOpenExportZip,
}) => {
  const { user, isAdmin, isAuthenticated, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Zone 1: Wordmark (Single text element) */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-xl font-serif font-bold tracking-tight text-stone-900 hover:text-stone-800 transition-colors"
          >
            Books and Friends
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
          <a href="#sessions" className="hover:text-stone-900 transition-colors">
            Reading Sessions
          </a>
          <button
            onClick={onOpenLibrary}
            className="hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Library</span>
          </button>
          <button
            onClick={onScrollToPipeline}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            Architecture Pipeline
          </button>
          <button
            onClick={onOpenExportZip}
            className="hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1 text-amber-900 font-semibold"
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-800" />
            <span>Export ZIP</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions / Profile Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 transition-colors text-xs text-stone-800 cursor-pointer"
                aria-expanded={showProfileMenu}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-7 h-7 rounded-full bg-stone-200 border border-stone-300 object-cover"
                />
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-stone-900 leading-tight flex items-center gap-1">
                    <span>{user.username}</span>
                    {isAdmin && <Shield className="w-3 h-3 text-amber-700" />}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate max-w-[120px]">
                    {isAdmin ? 'Developer Admin' : user.isDemo ? 'Demo Profile' : 'Reader Account'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Reader Profile Menu (Pop-up Component as specified in Section 8.1) */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg border border-stone-200 shadow-xl z-50 py-2 text-xs divide-y divide-stone-100">
                    {/* 1. User Information Display */}
                    <div className="px-4 py-3 bg-stone-50/50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-8 h-8 rounded-full border border-stone-300 bg-stone-200 object-cover"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 text-sm leading-tight">
                              {user.username}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono truncate max-w-[140px]">
                              {user.bookClubEmail}
                            </div>
                          </div>
                        </div>

                        {/* Account Status Badge (Section 8.1: "Demo Profile") */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            isAdmin
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : user.isDemo
                              ? 'bg-stone-200 text-stone-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isAdmin ? 'Admin Owner' : user.isDemo ? 'Demo Profile' : 'Personal Profile'}
                        </span>
                      </div>

                      {/* Mail match status */}
                      <div className="mt-2.5 pt-2 border-t border-stone-200/60 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Matching Mail Validated</span>
                      </div>
                    </div>

                    {/* 2. Menu Options */}
                    <div className="py-1.5 px-1 space-y-0.5">
                      {/* Edit Reader Profile */}
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenProfile();
                        }}
                        className="w-full text-left px-3 py-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        <span>Edit Reader Profile</span>
                      </button>

                      {/* Switch Reader Account */}
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenSwitchAccount();
                        }}
                        className="w-full text-left px-3 py-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors flex items-center justify-between cursor-pointer font-medium"
                      >
                        <span className="flex items-center gap-2.5">
                          <RefreshCw className="w-4 h-4 text-stone-500" />
                          <span>Switch Reader Account</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-500 rounded font-normal">
                          Demo only
                        </span>
                      </button>

                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          signOut();
                        }}
                        className="w-full text-left px-3 py-2 text-rose-700 hover:bg-rose-50 rounded transition-colors flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded transition-colors cursor-pointer"
              >
                Join Club
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
