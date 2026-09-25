import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ReadingSession } from '../types';
import { getReadingSessions, saveReadingSessions } from '../lib/supabase';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (session: ReadingSession) => void;
  initialBook?: {
    title: string;
    author: string;
    coverUrl?: string;
    directUrl?: string;
    totalChapters?: number;
    clubNote?: string;
  } | null;
}

const QUICK_PICK_POPULAR_BOOKS = [
  {
    title: 'Dune',
    author: 'Frank Herbert',
    chapters: 22,
    coverUrl: 'https://covers.openlibrary.org/b/id/11153218-L.jpg',
    directUrl: 'https://openlibrary.org/works/OL893415W',
    clubNote: 'Reading the epic desert saga of Arrakis with weekly discussion milestones.',
  },
  {
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    chapters: 20,
    coverUrl: '/src/assets/images/book_cover_speculative_1790311206408.jpg',
    directUrl: 'https://openlibrary.org/works/OL1802W',
    clubNote: 'Exploration of gender, sociology, and Winter diplomacy.',
  },
  {
    title: '1984',
    author: 'George Orwell',
    chapters: 24,
    coverUrl: 'https://covers.openlibrary.org/b/id/8575708-L.jpg',
    directUrl: 'https://openlibrary.org/works/OL1168083W',
    clubNote: 'Classic dystopian reading circle analyzing surveillance and truth.',
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    chapters: 61,
    coverUrl: '/src/assets/images/book_cover_classic_1790311217959.jpg',
    directUrl: 'https://openlibrary.org/works/OL281691W',
    clubNote: 'Regency society and timeless wit read chapter-by-chapter.',
  },
  {
    title: 'Ficciones',
    author: 'Jorge Luis Borges',
    chapters: 17,
    coverUrl: '/src/assets/images/book_cover_curated_1790311230114.jpg',
    directUrl: 'https://openlibrary.org/works/OL734199W',
    clubNote: 'Labyrinths, infinite libraries, and philosophical short stories.',
  },
];

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
  initialBook,
}) => {
  const { user } = useAuth();

  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalChapters, setTotalChapters] = useState(20);
  const [targetFinishDate, setTargetFinishDate] = useState('');
  const [borrowStatus, setBorrowStatus] = useState(true);
  const [coverArtworkUrl, setCoverArtworkUrl] = useState('');
  const [directBookUrl, setDirectBookUrl] = useState('');
  const [clubNote, setClubNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronize initialBook when passed or changed
  useEffect(() => {
    if (initialBook) {
      setBookTitle(initialBook.title || '');
      setAuthor(initialBook.author || '');
      setTotalChapters(initialBook.totalChapters || 20);
      setCoverArtworkUrl(initialBook.coverUrl || '');
      setDirectBookUrl(initialBook.directUrl || '');
      setClubNote(initialBook.clubNote || '');
    } else {
      // Default reset if no initial book
      setBookTitle('');
      setAuthor('');
      setTotalChapters(20);
      setCoverArtworkUrl('');
      setDirectBookUrl('');
      setClubNote('');
    }
    setFormError(null);
  }, [initialBook, isOpen]);

  if (!isOpen) return null;

  const handleQuickPick = (pick: typeof QUICK_PICK_POPULAR_BOOKS[0]) => {
    setBookTitle(pick.title);
    setAuthor(pick.author);
    setTotalChapters(pick.chapters);
    setCoverArtworkUrl(pick.coverUrl);
    setDirectBookUrl(pick.directUrl);
    setClubNote(pick.clubNote);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setFormError('Book Title is required.');
      return;
    }
    if (!author.trim()) {
      setFormError('Author Name is required.');
      return;
    }
    if (!totalChapters || totalChapters <= 0) {
      setFormError('Total Chapters must be greater than zero.');
      return;
    }

    // Generate unique Invite Code as specified (e.g. BF-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedInviteCode = `BF-${randomSuffix}`;

    const newSession: ReadingSession = {
      id: `sess-${Date.now()}`,
      hostId: user?.id || 'guest',
      hostName: user?.username || 'Reader Host',
      inviteCode: generatedInviteCode,
      bookTitle: bookTitle.trim(),
      author: author.trim(),
      totalChapters: Number(totalChapters),
      targetFinishDate: targetFinishDate || undefined,
      borrowStatus: Boolean(borrowStatus),
      coverArtworkUrl:
        coverArtworkUrl.trim() ||
        '/src/assets/images/book_cover_speculative_1790311206408.jpg',
      directBookUrl: directBookUrl.trim() || undefined,
      clubNote: clubNote.trim() || undefined,
      createdAt: new Date().toISOString(),
      membersCount: 1,
    };

    // Save to local Supabase / local storage session store
    const currentSessions = getReadingSessions();
    currentSessions.unshift(newSession);
    saveReadingSessions(currentSessions);

    onSessionCreated(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-lg w-full max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 sticky top-0 bg-white z-10">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">
              Reading Session Feature (Section 4)
            </span>
            <h3 className="text-base font-serif font-bold text-stone-900">
              New Session Box
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick Pick Popular Books */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Quick Pick Popular Books
              </span>
              <span className="text-[10px] text-stone-400">Click to autofill</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PICK_POPULAR_BOOKS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPick(p)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] border border-stone-200 transition-colors cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-100 my-2" />

          {/* Book Title (Required) */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Book Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="e.g. Dune or The Left Hand of Darkness"
              className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Author (Required) */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Author <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Frank Herbert or Ursula K. Le Guin"
              className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Total Chapters (Required) & Target finish Date (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Total Chapters <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalChapters}
                onChange={(e) => setTotalChapters(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Target Finish Date <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={targetFinishDate}
                onChange={(e) => setTargetFinishDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Borrow status (Visible for borrowed books) */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={borrowStatus}
                onChange={(e) => setBorrowStatus(e.target.checked)}
                className="mt-0.5 rounded text-stone-900 focus:ring-stone-900 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-stone-900 block">
                  Borrow Status (Visible for Borrowed Books)
                </span>
                <span className="text-[11px] text-stone-500 block leading-relaxed">
                  When enabled, marks the book as borrowed via Open Library or affiliated library collection.
                </span>
              </div>
            </label>
          </div>

          {/* Book Cover Artwork URL (Optional) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Book Cover Artwork URL <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={coverArtworkUrl}
              onChange={(e) => setCoverArtworkUrl(e.target.value)}
              placeholder="https://covers.openlibrary.org/b/isbn/... or custom cover URL"
              className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            {coverArtworkUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={coverArtworkUrl}
                  alt="Preview"
                  className="w-9 h-12 object-cover rounded border border-stone-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/src/assets/images/book_cover_speculative_1790311206408.jpg';
                  }}
                />
                <span className="text-[10px] text-stone-500">Artwork preview loaded</span>
              </div>
            )}
          </div>

          {/* Direct Book URL (Optional - direct link to the book's page) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Direct Book URL <span className="text-stone-400 font-normal">(Optional - direct link to book's page)</span>
            </label>
            <input
              type="url"
              value={directBookUrl}
              onChange={(e) => setDirectBookUrl(e.target.value)}
              placeholder="https://openlibrary.org/works/OL..."
              className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Club Note / Reading synopsis (Optional) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Club Note / Reading Synopsis <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={clubNote}
              onChange={(e) => setClubNote(e.target.value)}
              placeholder="Reading pace, milestones, or notes for book club members..."
              className="w-full px-3 py-2 border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 leading-relaxed"
            />
          </div>

          {/* Host info indicator */}
          <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded border border-stone-100 flex items-center justify-between">
            <span>Hosted by: <strong className="text-stone-800">{user?.username || 'Reader Host'}</strong></span>
            <span className="font-mono text-stone-400">Invite Code will auto-generate</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-stone-600 hover:text-stone-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Start Reading Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
