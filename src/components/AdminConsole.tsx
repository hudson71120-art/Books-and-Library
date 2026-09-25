import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ReadingSession } from '../types';
import {
  adminInsertSession,
  adminUpdateSession,
  adminDeleteSession,
  ADMIN_EMAIL,
  SUPABASE_RBAC_SQL_SCHEMA,
} from '../lib/supabase';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  X,
  Copy,
  Check,
} from 'lucide-react';

interface AdminConsoleProps {
  sessions: ReadingSession[];
  onRefresh: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ sessions, onRefresh }) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'crud' | 'json_select' | 'schema' | 'security'>('crud');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Insert form state
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newChapters, setNewChapters] = useState(20);
  const [newDate, setNewDate] = useState('2026-11-30');
  const [newBorrow, setNewBorrow] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit state
  const [editingSession, setEditingSession] = useState<ReadingSession | null>(null);

  // Filtered sessions for SELECT query
  const queriedSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.bookTitle.toLowerCase().includes(q) ||
      s.author.toLowerCase().includes(q) ||
      s.inviteCode.toLowerCase().includes(q) ||
      s.hostName.toLowerCase().includes(q)
    );
  });

  // STRICT ROLE-BASED ACCESS CONTROL ENFORCEMENT:
  // Non-admins cannot see or interact with this component
  if (!isAdmin || !user || user.bookClubEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  const handleAdminInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const res = await adminInsertSession(
      {
        hostId: user.id,
        hostName: user.username,
        inviteCode: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
        bookTitle: newTitle.trim(),
        author: newAuthor.trim(),
        totalChapters: Number(newChapters),
        targetFinishDate: newDate,
        borrowStatus: newBorrow,
        coverArtworkUrl: '/src/assets/images/book_cover_speculative_1790311206408.jpg',
        directBookUrl: 'https://openlibrary.org',
        clubNote: newNote.trim() || 'Curated directly by Developer Admin.',
        membersCount: 1,
      },
      user.bookClubEmail
    );

    if (res.success) {
      setActionNotice(`Successfully inserted session: "${newTitle}"`);
      setShowInsertModal(false);
      setNewTitle('');
      setNewAuthor('');
      setNewNote('');
      onRefresh();
    }
  };

  const handleAdminDelete = async (sessionId: string, title: string) => {
    if (!window.confirm(`Developer Admin Action: Confirm permanent deletion of session "${title}"?`)) {
      return;
    }

    const res = await adminDeleteSession(sessionId, user.bookClubEmail);
    if (res.success) {
      setActionNotice(`Deleted session record "${title}" (ID: ${sessionId})`);
      onRefresh();
    }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    const res = await adminUpdateSession(
      editingSession.id,
      {
        bookTitle: editingSession.bookTitle,
        author: editingSession.author,
        totalChapters: Number(editingSession.totalChapters),
        borrowStatus: editingSession.borrowStatus,
        clubNote: editingSession.clubNote,
      },
      user.bookClubEmail
    );

    if (res.success) {
      setActionNotice(`Updated record "${editingSession.bookTitle}"`);
      setEditingSession(null);
      onRefresh();
    }
  };

  return (
    <div className="my-8 bg-amber-50/50 border-2 border-amber-300 rounded-lg p-5">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-200/80 text-amber-900 rounded">
              <ShieldAlert className="w-3.5 h-3.5" />
              Role: Developer Admin Exclusive
            </span>
            <span className="text-xs text-amber-800 font-mono">
              Authorized: {user.bookClubEmail}
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-stone-900 mt-1">
            Database & System Management Console
          </h2>
          <p className="text-xs text-stone-600">
            Full RBAC authorization granted to Insert, Update, Delete, and Select data across the database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInsertModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-900 hover:bg-amber-950 rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Admin Insert Record</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-3 border-b border-amber-200/80 text-xs">
        <button
          onClick={() => setActiveTab('crud')}
          className={`pb-2 font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'crud'
              ? 'border-amber-900 text-amber-950 font-semibold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Active Sessions Table (SELECT / UPDATE / DELETE)
        </button>
        <button
          onClick={() => setActiveTab('json_select')}
          className={`pb-2 font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'json_select'
              ? 'border-amber-900 text-amber-950 font-semibold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          SELECT Explorer (Live JSON & Audit)
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-2 font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schema'
              ? 'border-amber-900 text-amber-950 font-semibold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Supabase SQL Schema (RBAC)
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-2 font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'border-amber-900 text-amber-950 font-semibold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Access Boundaries & Isolation Audit
        </button>
      </div>

      {actionNotice && (
        <div className="mt-3 p-2.5 bg-emerald-100/90 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: CRUD Controls */}
      {activeTab === 'crud' && (
        <div className="mt-4 space-y-3">
          {/* Live Search & Filter Bar (SELECT) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded border border-amber-200">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                SELECT Query:
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query database by title, author, invite code, host..."
                className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-900 bg-stone-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-700 text-xs font-semibold px-1"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-[11px] text-stone-600 font-mono">
              Query Result: <strong>{queriedSessions.length}</strong> / {sessions.length} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-amber-200 bg-white rounded">
              <thead className="bg-amber-100/60 text-stone-800 font-semibold border-b border-amber-200">
                <tr>
                  <th className="p-2.5">Invite Code</th>
                  <th className="p-2.5">Book Title & Author</th>
                  <th className="p-2.5">Host</th>
                  <th className="p-2.5">Total Chapters</th>
                  <th className="p-2.5">Borrow Status</th>
                  <th className="p-2.5 text-right">Admin Privileges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {queriedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-stone-500">
                      No records match query "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  queriedSessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-amber-50/40">
                      <td className="p-2.5 font-mono text-[11px] font-medium text-stone-700">{sess.inviteCode}</td>
                      <td className="p-2.5">
                        <div className="font-medium text-stone-900">{sess.bookTitle}</div>
                        <div className="text-[11px] text-stone-500">{sess.author}</div>
                      </td>
                      <td className="p-2.5 text-stone-600">{sess.hostName}</td>
                      <td className="p-2.5 tabular-nums text-stone-700">{sess.totalChapters} chs</td>
                      <td className="p-2.5">
                        {sess.borrowStatus ? (
                          <span className="text-[11px] text-emerald-700 font-medium">Borrowed (Active)</span>
                        ) : (
                          <span className="text-[11px] text-stone-500">Owned / Direct</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingSession(sess)}
                            title="Update Record (Admin Privilege)"
                            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-amber-100 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdminDelete(sess.id, sess.bookTitle)}
                            title="Delete Record (Admin Privilege)"
                            className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Live JSON & SELECT Explorer */}
      {activeTab === 'json_select' && (
        <div className="mt-4 bg-stone-900 text-stone-200 p-4 rounded text-xs font-mono overflow-x-auto max-h-96">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400">
            <span>-- SELECT * FROM reading_sessions; (Total records: {sessions.length})</span>
            <span className="text-[11px] text-amber-400 font-sans">Developer Admin Authorized</span>
          </div>
          <pre className="select-all leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(sessions, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB 2: Supabase Schema */}
      {activeTab === 'schema' && (
        <div className="mt-4 bg-stone-900 text-stone-200 p-4 rounded text-xs font-mono overflow-x-auto max-h-96">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400">
            <span>-- Supabase Admin RBAC SQL (Execute in Supabase SQL Editor)</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(SUPABASE_RBAC_SQL_SCHEMA);
                setCopiedSchema(true);
                setTimeout(() => setCopiedSchema(false), 2000);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded cursor-pointer transition-colors"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copied' : 'Copy SQL Schema'}</span>
            </button>
          </div>
          <pre className="select-all leading-relaxed">{SUPABASE_RBAC_SQL_SCHEMA}</pre>
        </div>
      )}

      {/* TAB 3: Security & Isolation Audit */}
      {activeTab === 'security' && (
        <div className="mt-4 p-4 bg-white rounded border border-amber-200 text-xs text-stone-700 space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">User Account Isolation:</strong> Regular user accounts cannot be accessed, listed, or modified by other regular users. All permissions are evaluated strictly at the backend boundary.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Admin Credential Protection:</strong> Developer Admin credentials and management controls are completely hidden from regular user sessions.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Mail Validation Lock:</strong> Sessions can only enable Open Library syncing and borrow indicators when the user's Book Club Mail and Open Library Mail match identically.
            </div>
          </div>
        </div>
      )}

      {/* Admin Insert Record Modal */}
      {showInsertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-serif font-bold text-stone-900">Admin Insert New Session Record</h3>
              <button onClick={() => setShowInsertModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdminInsert} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The Architecture of Silence"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Author</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Alistair Finch"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Total Chapters</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newChapters}
                    onChange={(e) => setNewChapters(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Target Finish Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adminBorrowCheck"
                  checked={newBorrow}
                  onChange={(e) => setNewBorrow(e.target.checked)}
                  className="rounded text-amber-900 focus:ring-amber-900"
                />
                <label htmlFor="adminBorrowCheck" className="text-stone-700 select-none">
                  Borrow status active (synced with Open Library)
                </label>
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Club Note / Synopsis</label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Synopsis or notes for members..."
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInsertModal(false)}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-900 text-white rounded font-medium hover:bg-amber-950 transition-colors"
                >
                  Confirm Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Record Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-serif font-bold text-stone-900">
                Admin Update Record ({editingSession.inviteCode})
              </h3>
              <button onClick={() => setEditingSession(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdminUpdate} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={editingSession.bookTitle}
                  onChange={(e) => setEditingSession({ ...editingSession, bookTitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Author</label>
                <input
                  type="text"
                  required
                  value={editingSession.author}
                  onChange={(e) => setEditingSession({ ...editingSession, author: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Total Chapters</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editingSession.totalChapters}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, totalChapters: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editBorrowCheck"
                  checked={editingSession.borrowStatus}
                  onChange={(e) => setEditingSession({ ...editingSession, borrowStatus: e.target.checked })}
                  className="rounded text-amber-900"
                />
                <label htmlFor="editBorrowCheck" className="text-stone-700 select-none">
                  Borrow status active
                </label>
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Club Note</label>
                <textarea
                  rows={2}
                  value={editingSession.clubNote || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, clubNote: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-stone-900"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-900 text-white rounded font-medium hover:bg-amber-950 transition-colors"
                >
                  Save Record Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
