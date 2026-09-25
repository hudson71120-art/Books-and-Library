import React, { useState, useEffect } from 'react';
import { ReadingSession } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getUserJoinedSessionIds,
  saveUserJoinedSessionIds,
  userUpdateOwnSession,
  userDeleteOwnSession,
} from '../lib/supabase';
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Users,
  LogOut,
  Plus,
  KeyRound,
  CheckCircle,
  Copy,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

interface SessionsListProps {
  sessions: ReadingSession[];
  onOpenNewSession: () => void;
  onRefresh: () => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  onOpenNewSession,
  onRefresh,
}) => {
  const { user, isAdmin } = useAuth();
  const currentUserId = user?.id || 'guest';

  // User-isolated joined sessions
  const [joinedSessionIds, setJoinedSessionIds] = useState<string[]>(() =>
    getUserJoinedSessionIds(currentUserId)
  );

  // Sync joined sessions when user changes
  useEffect(() => {
    setJoinedSessionIds(getUserJoinedSessionIds(currentUserId));
  }, [currentUserId]);

  const updateJoinedSessions = (newIds: string[]) => {
    setJoinedSessionIds(newIds);
    saveUserJoinedSessionIds(currentUserId, newIds);
  };

  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'joined'>('all');
  const [inviteInput, setInviteInput] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // User Edit Own Session Modal state
  const [editingSession, setEditingSession] = useState<ReadingSession | null>(null);
  const [editChapters, setEditChapters] = useState<number>(20);
  const [editTargetDate, setEditTargetDate] = useState<string>('');
  const [editBorrowStatus, setEditBorrowStatus] = useState<boolean>(true);
  const [editClubNote, setEditClubNote] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  // 1. Join reading session via Invite Code (Section 6)
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    const code = inviteInput.trim().toUpperCase();
    const matched = sessions.find((s) => s.inviteCode.toUpperCase() === code);

    if (matched) {
      if (joinedSessionIds.includes(matched.id)) {
        setFeedback({
          message: `You are already a member of reading session "${matched.bookTitle}".`,
          type: 'info',
        });
      } else {
        const updated = [...joinedSessionIds, matched.id];
        updateJoinedSessions(updated);
        setFeedback({
          message: `Successfully joined "${matched.bookTitle}" (Hosted by ${matched.hostName}) via Invite Code ${matched.inviteCode}!`,
          type: 'success',
        });
        setInviteInput('');
      }
    } else {
      setFeedback({
        message: `No active reading session found with Invite Code "${code}". Please verify and try again.`,
        type: 'error',
      });
    }
  };

  // 2. Direct Join
  const handleDirectJoin = (session: ReadingSession) => {
    if (!joinedSessionIds.includes(session.id)) {
      const updated = [...joinedSessionIds, session.id];
      updateJoinedSessions(updated);
      setFeedback({
        message: `You joined "${session.bookTitle}" (Hosted by ${session.hostName})!`,
        type: 'success',
      });
    }
  };

  // 3. Exit Session (Section 6: If a user connects incorrectly or mistakenly)
  const handleExitSession = (sessionId: string, title: string, inviteCode: string) => {
    const updated = joinedSessionIds.filter((id) => id !== sessionId);
    updateJoinedSessions(updated);
    setFeedback({
      message: `You have left the reading session for "${title}". If this was accidental, you can rejoin anytime with Invite Code ${inviteCode}.`,
      type: 'info',
    });
  };

  // 4. User Access Boundaries: Edit own session
  const openEditModal = (session: ReadingSession) => {
    setEditingSession(session);
    setEditChapters(session.totalChapters);
    setEditTargetDate(session.targetFinishDate || '');
    setEditBorrowStatus(session.borrowStatus);
    setEditClubNote(session.clubNote || '');
    setEditError(null);
  };

  const handleSaveOwnSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !user) return;

    const res = await userUpdateOwnSession(
      editingSession.id,
      {
        totalChapters: editChapters,
        targetFinishDate: editTargetDate || undefined,
        borrowStatus: editBorrowStatus,
        clubNote: editClubNote.trim() || undefined,
      },
      user
    );

    if (res.success) {
      setFeedback({
        message: `Your reading session "${editingSession.bookTitle}" has been updated successfully.`,
        type: 'success',
      });
      setEditingSession(null);
      onRefresh();
    } else {
      setEditError(res.error || 'Failed to update session.');
    }
  };

  // 5. User Access Boundaries: Delete own session
  const handleDeleteOwnSession = async (session: ReadingSession) => {
    if (!user) return;
    const confirmDelete = window.confirm(
      `Delete your reading session "${session.bookTitle}"? This will remove it from the community.`
    );
    if (!confirmDelete) return;

    const res = await userDeleteOwnSession(session.id, user);
    if (res.success) {
      setFeedback({
        message: `Your reading session "${session.bookTitle}" has been deleted.`,
        type: 'info',
      });
      // also clean from joined
      updateJoinedSessions(joinedSessionIds.filter((id) => id !== session.id));
      onRefresh();
    } else {
      setFeedback({
        message: res.error || 'Permission Denied: Unable to delete session.',
        type: 'error',
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === 'my') {
      return user && (s.hostId === user.id || s.hostName === user.username);
    }
    if (activeFilter === 'joined') {
      return joinedSessionIds.includes(s.id);
    }
    return true;
  });

  return (
    <section id="sessions" className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Top Header & Session Management Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              Section 6: User Access Boundaries & Session Management
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">Live Reading Circles</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">
            Active Reading Sessions
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
            Join sessions hosted by other readers via <strong>Invite Code</strong>, or create your own through <strong>Start New Reading Session</strong>. In case of mistaken connection, use the <strong>Exit Session</strong> button to leave.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Join with Invite Code Form (Section 6) */}
          <form onSubmit={handleJoinByCode} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="Enter Invite Code (e.g. BF-8801)"
                className="px-3 py-1.5 pl-8 text-xs bg-white border border-stone-300 rounded shadow-xs focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 font-mono uppercase placeholder:font-sans placeholder:normal-case"
              />
              <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded transition-colors cursor-pointer"
            >
              Join via Code
            </button>
          </form>

          {/* Start New Reading Session Button (Section 6) */}
          <button
            onClick={onOpenNewSession}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Reading Session</span>
          </button>
        </div>
      </div>

      {/* Access Boundary Navigation & Filtering Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-6 border-b border-stone-200 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            All Community Sessions ({sessions.length})
          </button>

          <button
            onClick={() => setActiveFilter('my')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'my'
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>My Hosted Sessions</span>
            {user && (
              <span className="text-[10px] bg-stone-700 text-stone-200 px-1.5 py-0.2 rounded-full">
                {sessions.filter((s) => s.hostId === user.id || s.hostName === user.username).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('joined')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'joined'
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Joined Circles</span>
            <span className="text-[10px] bg-stone-700 text-stone-200 px-1.5 py-0.2 rounded-full">
              {joinedSessionIds.length}
            </span>
          </button>
        </div>

        {/* Boundary Notice */}
        <div className="text-[11px] text-stone-500 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-stone-400" />
          <span>
            {isAdmin
              ? '👑 Developer Admin: Full CRUD cross-user authorization enabled'
              : '🔒 User Boundary: You can only edit or delete sessions you personally host'}
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mb-6 p-3 rounded text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-stone-100 text-stone-800 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <KeyRound className="w-4 h-4 text-stone-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-500 hover:text-stone-700 font-semibold text-xs ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid of Sessions with exact required Display Elements & Boundaries */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-stone-200 text-xs text-stone-500">
          <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="font-semibold text-stone-800">
            {activeFilter === 'my'
              ? 'You have not hosted any reading sessions yet.'
              : activeFilter === 'joined'
              ? 'You have not joined any reading sessions yet.'
              : 'No reading sessions found.'}
          </p>
          <p className="mt-1">
            Click "Start New Reading Session" to host your first circle, or enter an Invite Code to join.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const isJoined = joinedSessionIds.includes(session.id);
            const isMySession = Boolean(
              user && (session.hostId === user.id || session.hostName === user.username)
            );
            const canManage = isMySession || isAdmin;

            return (
              <div
                key={session.id}
                className={`bg-white rounded-lg border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group ${
                  isMySession
                    ? 'border-amber-300 ring-1 ring-amber-200/50'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                {/* 1. Book Cover Artwork container */}
                <div className="h-56 bg-stone-100 overflow-hidden relative">
                  <img
                    src={
                      session.coverArtworkUrl ||
                      '/src/assets/images/book_cover_speculative_1790311206408.jpg'
                    }
                    alt={session.bookTitle}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Host ownership badge (User Access Boundary) */}
                  {isMySession && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-amber-950/90 text-amber-200 text-[10px] font-semibold rounded backdrop-blur-xs flex items-center gap-1 shadow-xs border border-amber-500/40">
                      <UserCheck className="w-3 h-3 text-amber-400" />
                      <span>Your Hosted Session</span>
                    </div>
                  )}

                  {/* Admin authorization indicator on other users' sessions */}
                  {isAdmin && !isMySession && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-amber-900/90 text-amber-100 text-[10px] font-semibold rounded backdrop-blur-xs flex items-center gap-1 shadow-xs border border-amber-500/40">
                      <Shield className="w-3 h-3 text-amber-300" />
                      <span>Admin Overwrite Access</span>
                    </div>
                  )}

                  {/* Borrow status indicator (Visible for borrowed books) */}
                  {session.borrowStatus && !isMySession && !isAdmin && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-950/85 text-emerald-200 text-[10px] font-medium rounded backdrop-blur-xs flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Borrowed (Open Library Sync)</span>
                    </div>
                  )}

                  {/* 2. Invite Code Badge with Copy Function */}
                  <button
                    type="button"
                    onClick={() => handleCopyCode(session.inviteCode)}
                    className="absolute top-3 right-3 px-2 py-1 bg-stone-900/85 hover:bg-stone-900 text-stone-200 text-[10px] font-mono rounded flex items-center gap-1.5 backdrop-blur-xs cursor-pointer transition-colors shadow-xs"
                    title="Click to copy Invite Code"
                  >
                    <span>Invite: <strong>{session.inviteCode}</strong></span>
                    {copiedCode === session.inviteCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-stone-400" />
                    )}
                  </button>

                  {/* Target finish date badge if set */}
                  {session.targetFinishDate && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-stone-900/75 text-stone-300 text-[10px] font-mono rounded backdrop-blur-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>Finish by {session.targetFinishDate}</span>
                    </div>
                  )}
                </div>

                {/* Session Body Details: Total Chapters, Hosted by, Book Title, Author Name */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* 3. Book Title */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-serif font-bold text-stone-900 leading-snug group-hover:text-amber-950">
                        {session.bookTitle}
                      </h3>

                      {/* Personal controls for Host (Section 6: Update/Delete own session) */}
                      {canManage && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(session)}
                            title={isMySession ? "Edit your session" : "Admin edit"}
                            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOwnSession(session)}
                            title={isMySession ? "Delete your session" : "Admin delete"}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 4. Author Name */}
                    <p className="text-xs text-stone-600 mt-1 font-medium">
                      by <span className="text-stone-800">{session.author}</span>
                    </p>

                    {/* 5. Total Chapters & 6. Hosted by [Username] */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-stone-900 tabular-nums">
                        {session.totalChapters} Chapters
                      </span>
                      <span className="text-stone-300">·</span>
                      <span>
                        Hosted by <strong className="text-stone-800 font-semibold">{session.hostName}</strong>
                      </span>
                    </div>

                    {/* Club Note / Reading synopsis (Optional) */}
                    {session.clubNote && (
                      <p className="mt-3 text-xs text-stone-600 italic border-l-2 border-stone-200 pl-3 py-0.5 leading-relaxed bg-stone-50/50 rounded-r">
                        "{session.clubNote}"
                      </p>
                    )}
                  </div>

                  {/* Bottom Actions: Edition Link, Join, or Exit Session */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      {session.directBookUrl ? (
                        <a
                          href={session.directBookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-600 hover:text-stone-900 flex items-center gap-1 text-[11px] font-medium"
                          title="Open book's direct Open Library catalog page"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                          <span>Direct Book Link</span>
                          <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-stone-400">Open Library edition</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isJoined ? (
                        /* Exit Session button (Section 6) */
                        <button
                          type="button"
                          onClick={() =>
                            handleExitSession(session.id, session.bookTitle, session.inviteCode)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer shadow-2xs"
                          title="If connected mistakenly or finished, click to exit this reading session"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Exit Session</span>
                        </button>
                      ) : (
                        /* Join Session button (Section 6) */
                        <button
                          type="button"
                          onClick={() => handleDirectJoin(session)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded transition-colors cursor-pointer shadow-2xs"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Join Session</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Edit Own Session Modal (Section 6) */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase font-semibold text-stone-500">
                  User Access Boundary: Personal Edit
                </span>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Update "{editingSession.bookTitle}"
                </h3>
              </div>
              <button
                onClick={() => setEditingSession(null)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOwnSession} className="space-y-3.5 mt-4">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Total Chapters
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editChapters}
                  onChange={(e) => setEditChapters(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Target Finish Date (Optional)
                </label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editBorrowStatus}
                    onChange={(e) => setEditBorrowStatus(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-stone-900"
                  />
                  <span className="font-medium text-stone-800">
                    Borrow Status Active (Open Library Sync)
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Club Note / Reading Synopsis
                </label>
                <textarea
                  rows={3}
                  value={editClubNote}
                  onChange={(e) => setEditClubNote(e.target.value)}
                  placeholder="Notes for club members..."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 text-white rounded font-semibold hover:bg-stone-800 cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
