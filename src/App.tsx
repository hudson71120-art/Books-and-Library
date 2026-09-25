import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { WorkflowPipeline } from './components/WorkflowPipeline';
import { SessionsList } from './components/SessionsList';
import { AdminConsole } from './components/AdminConsole';
import { OpenLibraryExplorer } from './components/OpenLibraryExplorer';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SwitchAccountModal } from './components/SwitchAccountModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { NewSessionModal } from './components/NewSessionModal';
import { ExportZipModal } from './components/ExportZipModal';
import { ReadingSession } from './types';
import { getReadingSessions } from './lib/supabase';
import { BookOpen, FolderArchive } from 'lucide-react';

function MainAppContent() {
  const { user, isAdmin } = useAuth();
  const [sessions, setSessions] = useState<ReadingSession[]>(() => getReadingSessions());

  // Modal controls
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode?: 'signin' | 'signup' | 'admin' }>({
    isOpen: false,
    mode: 'signin',
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isExportZipOpen, setIsExportZipOpen] = useState(false);
  const [selectedBookForSession, setSelectedBookForSession] = useState<{
    title: string;
    author: string;
    coverUrl?: string;
    directUrl?: string;
    totalChapters?: number;
    clubNote?: string;
  } | null>(null);

  const pipelineRef = useRef<HTMLDivElement>(null);

  const handleRefreshSessions = () => {
    setSessions([...getReadingSessions()]);
  };

  const handleScrollToPipeline = () => {
    pipelineRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectBookForSession = (book: {
    title: string;
    author: string;
    coverUrl?: string;
    directUrl?: string;
    totalChapters?: number;
    clubNote?: string;
  }) => {
    setSelectedBookForSession(book);
    setIsNewSessionOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Contract (Wordmark, Nav links, Profile Actions) */}
      <Header
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode: mode || 'signin' })}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
        onOpenLibrary={() => {
          document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToPipeline={handleScrollToPipeline}
        onOpenExportZip={() => setIsExportZipOpen(true)}
      />

      <main className="flex-1">
        {/* Curated Editorial Hero */}
        <HeroBanner
          onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode: mode || 'signin' })}
          onOpenNewSession={() => {
            setSelectedBookForSession(null);
            setIsNewSessionOpen(true);
          }}
          onOpenLibrary={() => {
            document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Step 1 Workflow Pipeline: Input -> Network -> Process -> Output */}
        <div ref={pipelineRef}>
          <WorkflowPipeline onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)} />
        </div>

        {/* Developer Admin Exclusive Management Console (Strictly visible ONLY when logged in as Owner) */}
        {isAdmin && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AdminConsole sessions={sessions} onRefresh={handleRefreshSessions} />
          </div>
        )}

        {/* Active Reading Sessions (Step 4 & 6: Display, Invite Code, Join, Exit) */}
        <SessionsList
          sessions={sessions}
          onOpenNewSession={() => {
            setSelectedBookForSession(null);
            setIsNewSessionOpen(true);
          }}
          onRefresh={handleRefreshSessions}
        />

        {/* Open Library Real-Time On-Demand Search & Cache (Step 3) */}
        <OpenLibraryExplorer onSelectBookForSession={handleSelectBookForSession} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-700" />
            <span className="font-serif font-bold text-stone-900">Books and Friends App</span>
            <span className="text-stone-300">·</span>
            <span>Connected with Supabase & Open Library</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>Workflow: Input → Network → Process → Output</span>
            <span className="text-stone-300">·</span>
            <button
              onClick={() => setIsExportZipOpen(true)}
              className="text-stone-700 hover:text-stone-900 font-semibold underline flex items-center gap-1 cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Download Project .ZIP & Guide</span>
            </button>
            <span className="text-stone-300">·</span>
            <span>Developer Admin RBAC Secured</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState({ isOpen: false })}
        initialMode={authModalState.mode}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SwitchAccountModal
        isOpen={isSwitchAccountOpen}
        onClose={() => setIsSwitchAccountOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        onConfigUpdated={handleRefreshSessions}
      />

      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => {
          setIsNewSessionOpen(false);
          setSelectedBookForSession(null);
        }}
        onSessionCreated={() => {
          handleRefreshSessions();
        }}
        initialBook={selectedBookForSession}
      />

      <ExportZipModal
        isOpen={isExportZipOpen}
        onClose={() => setIsExportZipOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
