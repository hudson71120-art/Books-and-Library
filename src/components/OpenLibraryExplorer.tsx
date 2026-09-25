import React, { useState, useEffect } from 'react';
import {
  searchOpenLibrary,
  fetchWorkDetails,
  fetchBookByIsbn,
  getCoverImageUrl,
  cacheBookData,
  getCachedBooks,
  OpenLibraryDoc,
  CachedBookData,
} from '../lib/openLibrary';
import {
  Search,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Loader2,
  Sparkles,
  Info,
  X,
  PlusCircle,
  Database,
} from 'lucide-react';

interface OpenLibraryExplorerProps {
  onSelectBookForSession?: (book: {
    title: string;
    author: string;
    coverUrl?: string;
    directUrl?: string;
    totalChapters?: number;
    clubNote?: string;
  }) => void;
}

const CURATED_SEARCH_SUGGESTIONS = [
  'Dune Frank Herbert',
  'Foundation Asimov',
  '1984 George Orwell',
  'Pride and Prejudice Jane Austen',
  'The Hobbit Tolkien',
  'Brave New World Huxley',
];

export const OpenLibraryExplorer: React.FC<OpenLibraryExplorerProps> = ({
  onSelectBookForSession,
}) => {
  const [query, setQuery] = useState('Classic Literature');
  const [results, setResults] = useState<OpenLibraryDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBookDetail, setSelectedBookDetail] = useState<CachedBookData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'search' | 'cache'>('search');

  // Load initial cache count
  useEffect(() => {
    updateCacheCount();
    // Perform initial default search for instant exploration
    handleSearchQuery('Speculative Fiction', 8);
  }, []);

  const updateCacheCount = () => {
    const cached = getCachedBooks();
    setCacheCount(Object.keys(cached).length);
  };

  const handleSearchQuery = async (searchQuery: string, limit: number = 8) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const docs = await searchOpenLibrary(searchQuery.trim(), limit);
      setResults(docs);

      // Cache queried records into local database cache as requested
      docs.slice(0, 4).forEach((d) => {
        const coverUrl = getCoverImageUrl(d.cover_i, d.isbn?.[0], 'L');
        cacheBookData({
          key: d.key,
          isbn: d.isbn?.[0],
          title: d.title,
          author: d.author_name?.[0] || 'Open Library Author',
          firstPublishYear: d.first_publish_year,
          coverUrl: coverUrl,
          pages: d.number_of_pages_median,
          subjects: d.subject?.slice(0, 5),
          description: `Cataloged work in Open Library open database (${d.edition_count || 1} editions).`,
          cachedAt: new Date().toISOString(),
        });
      });

      updateCacheCount();
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSearchQuery(query, 12);
  };

  // View detailed work info via Works API or ISBN API
  const handleInspectBook = async (doc: OpenLibraryDoc) => {
    setLoadingDetail(true);
    const author = doc.author_name?.[0] || 'Open Library Author';

    try {
      let details: CachedBookData | null = null;

      // Try fetching by ISBN first if available for page count and edition summary
      if (doc.isbn && doc.isbn[0]) {
        details = await fetchBookByIsbn(doc.isbn[0]);
      }

      // If not, fetch by Work Key (https://openlibrary.org/works/{Key}.json)
      if (!details && doc.key) {
        details = await fetchWorkDetails(doc.key, author);
      }

      if (!details) {
        // Fallback to doc metadata
        details = {
          key: doc.key,
          isbn: doc.isbn?.[0],
          title: doc.title,
          author: author,
          firstPublishYear: doc.first_publish_year,
          coverUrl: getCoverImageUrl(doc.cover_i, doc.isbn?.[0], 'L'),
          pages: doc.number_of_pages_median || 250,
          description: 'Cataloged record retrieved from Open Library archive.',
          cachedAt: new Date().toISOString(),
          subjects: doc.subject?.slice(0, 5),
        };
      }

      setSelectedBookDetail(details);
      updateCacheCount();
    } catch (err) {
      console.error('Failed to load book details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStartSessionFromBook = (book: {
    title: string;
    author: string;
    coverUrl?: string;
    directUrl?: string;
    pages?: number;
    description?: string;
  }) => {
    if (onSelectBookForSession) {
      // Calculate estimated chapters based on page count or default to 20
      const estimatedChapters = book.pages ? Math.max(8, Math.round(book.pages / 20)) : 20;

      onSelectBookForSession({
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        directUrl: book.directUrl,
        totalChapters: estimatedChapters,
        clubNote: book.description ? book.description.slice(0, 180) + '...' : undefined,
      });
      setSelectedBookDetail(null);
    }
  };

  const handleOpenLibraryExternal = () => {
    window.open('https://openlibrary.org', '_blank', 'noopener,noreferrer');
  };

  const cachedEntries = Object.values(getCachedBooks());

  return (
    <section id="library" className="bg-[#faf8f5] border-y border-stone-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Strip & Library Connect Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
                Open Library API Integration (Section 3)
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-mono">REST: search.json | works/{'{Key}'} | isbn/{'{ISBN}'}</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">
              Open Library On-Demand Explorer
            </h2>
            <p className="text-xs text-stone-600 max-w-2xl mt-1 leading-relaxed">
              Query millions of books, authors, covers, and ISBNs in real time. Fetched records are automatically stored in the local database cache to optimize response times and network overhead.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenLibraryExternal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 rounded shadow-xs transition-colors cursor-pointer"
              title="Clicking the Library button connects to the Open Library API and opens the Open Library UI/website."
            >
              <BookOpen className="w-4 h-4 text-stone-700" />
              <span>Connect to Open Library UI</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Picks */}
        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search real-time by title, author name, or ISBN (e.g. Dune, Tolkien, Virginia Woolf, 9780441172719)..."
                className="w-full px-3.5 py-2.5 pl-10 text-xs bg-stone-50/70 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting API...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Open Library</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Query Suggestions */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
            <span className="flex items-center gap-1 text-stone-700 font-medium">
              <Sparkles className="w-3 h-3 text-amber-700" />
              Quick Searches:
            </span>
            {CURATED_SEARCH_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(s);
                  handleSearchQuery(s, 8);
                }}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-200/80 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sub-bar: Status and Cache toggle */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2 text-stone-600">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Local Database Caching Active:</span>
                <strong className="text-stone-900 font-mono">{cacheCount} works cached</strong>
              </span>
              <span className="text-stone-300">·</span>
              <span className="font-mono text-stone-500">Covers API (S/M/L) ready</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                }`}
              >
                Search Results ({results.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('cache');
                  updateCacheCount();
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'cache'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>Cached Records ({cacheCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Live Open Library Search Results */}
        {activeTab === 'search' && (
          <div>
            {loading && (
              <div className="py-16 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-stone-600" />
                <div className="space-y-1">
                  <p className="font-medium text-stone-800">Querying Open Library REST Endpoints...</p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    GET https://openlibrary.org/search.json?q={encodeURIComponent(query)}
                  </p>
                </div>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && (
              <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-lg border border-stone-200">
                No matching books found for "{query}". Please check the spelling or search by author/ISBN.
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {results.map((doc) => {
                  const coverUrl = getCoverImageUrl(doc.cover_i, doc.isbn?.[0], 'M');
                  const author = doc.author_name?.[0] || 'Open Library Author';

                  return (
                    <div
                      key={doc.key}
                      className="bg-white rounded-lg border border-stone-200 overflow-hidden flex flex-col hover:border-stone-400 hover:shadow-md transition-all group"
                    >
                      {/* Book Cover Container with quick actions */}
                      <div className="h-56 bg-stone-100 overflow-hidden flex items-center justify-center relative">
                        <img
                          src={coverUrl}
                          alt={doc.title}
                          className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                          loading="lazy"
                        />
                        {doc.first_publish_year && (
                          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-stone-900/80 text-white text-[10px] font-mono rounded backdrop-blur-xs">
                            {doc.first_publish_year}
                          </span>
                        )}
                        {doc.isbn && doc.isbn[0] && (
                          <span className="absolute top-2.5 left-2.5 px-1.5 py-0.5 bg-stone-900/70 text-stone-200 text-[9px] font-mono rounded backdrop-blur-xs truncate max-w-[130px]">
                            ISBN: {doc.isbn[0]}
                          </span>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-amber-950">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{author}</p>

                          {doc.subject && doc.subject[0] && (
                            <div className="mt-2 text-[10px] text-stone-500 bg-stone-50 px-2 py-1 rounded line-clamp-1 border border-stone-100">
                              {doc.subject.slice(0, 2).join(' · ')}
                            </div>
                          )}
                        </div>

                        {/* Interactive Buttons: Details & Start Session */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => handleInspectBook(doc)}
                            className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
                          >
                            <Info className="w-3 h-3 text-stone-400" />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStartSessionFromBook({
                                title: doc.title,
                                author: author,
                                coverUrl: getCoverImageUrl(doc.cover_i, doc.isbn?.[0], 'L'),
                                directUrl: `https://openlibrary.org${doc.key}`,
                                pages: doc.number_of_pages_median,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-stone-900 bg-stone-100 hover:bg-stone-900 hover:text-white rounded border border-stone-200 transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>New Session Box</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Local Database Cache View (High-Speed Local Storage) */}
        {activeTab === 'cache' && (
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-stone-600">
              <p>
                Showing records cached locally in the browser/database. These persist even when offline or disconnected.
              </p>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('bf_openlibrary_cache');
                  updateCacheCount();
                }}
                className="text-stone-500 hover:text-rose-700 text-[11px] underline cursor-pointer"
              >
                Clear Local Cache
              </button>
            </div>

            {cachedEntries.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-lg border border-stone-200">
                No cached books yet. Search and click books to cache them automatically.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cachedEntries.map((book, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-stone-200 p-3.5 flex gap-3 hover:border-stone-400 transition-all shadow-xs"
                  >
                    <img
                      src={book.coverUrl || '/src/assets/images/book_cover_speculative_1790311206408.jpg'}
                      alt={book.title}
                      className="w-16 h-22 object-cover rounded bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">{book.author}</p>
                        {book.pages && (
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {book.pages} pages
                          </span>
                        )}
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedBookDetail(book)}
                          className="text-[10px] text-stone-600 hover:text-stone-900 font-medium"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartSessionFromBook({
                              title: book.title,
                              author: book.author,
                              coverUrl: book.coverUrl,
                              directUrl: book.key.startsWith('/works')
                                ? `https://openlibrary.org${book.key}`
                                : undefined,
                              pages: book.pages,
                              description: book.description,
                            })
                          }
                          className="text-[10px] font-semibold text-stone-900 hover:text-amber-900 underline"
                        >
                          Start Session
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Book Detailed Inspection Modal (Works API & ISBN API summary) */}
      {(selectedBookDetail || loadingDetail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {loadingDetail ? (
              <div className="p-12 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
                <p>Fetching full synopsis & edition records from Open Library Works API...</p>
              </div>
            ) : selectedBookDetail ? (
              <div>
                <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-stone-700" />
                    <span className="text-xs font-semibold text-stone-800">
                      Open Library Edition Details
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedBookDetail(null)}
                    className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <img
                      src={
                        selectedBookDetail.coverUrl ||
                        '/src/assets/images/book_cover_speculative_1790311206408.jpg'
                      }
                      alt={selectedBookDetail.title}
                      className="w-32 h-44 object-cover rounded border border-stone-200 shadow-xs shrink-0 self-center sm:self-start"
                    />

                    <div className="flex-1 space-y-2 text-xs">
                      <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                        {selectedBookDetail.title}
                      </h3>
                      <p className="text-stone-600 font-medium">by {selectedBookDetail.author}</p>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                        {selectedBookDetail.firstPublishYear && (
                          <div className="p-2 bg-stone-50 rounded border border-stone-100">
                            <span className="text-stone-400 block">First Published</span>
                            <span className="font-semibold text-stone-800">
                              {selectedBookDetail.firstPublishYear}
                            </span>
                          </div>
                        )}
                        {selectedBookDetail.pages && (
                          <div className="p-2 bg-stone-50 rounded border border-stone-100">
                            <span className="text-stone-400 block">Page Count</span>
                            <span className="font-semibold text-stone-800">
                              {selectedBookDetail.pages} pages
                            </span>
                          </div>
                        )}
                        {selectedBookDetail.isbn && (
                          <div className="p-2 bg-stone-50 rounded border border-stone-100 col-span-2">
                            <span className="text-stone-400 block">ISBN Reference</span>
                            <span className="font-mono text-stone-800 text-[10px]">
                              {selectedBookDetail.isbn}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Synopsis / Summary */}
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
                      Book Summary & Synopsis
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded border border-stone-100 max-h-48 overflow-y-auto">
                      {selectedBookDetail.description ||
                        'No detailed summary is currently provided in the Open Library public archive for this edition.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {selectedBookDetail.key.startsWith('/works') ? (
                      <a
                        href={`https://openlibrary.org${selectedBookDetail.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
                      >
                        <span>Open on OpenLibrary.org</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                    ) : (
                      <span className="text-xs text-stone-400">Verified Edition</span>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedBookDetail(null)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleStartSessionFromBook({
                            title: selectedBookDetail.title,
                            author: selectedBookDetail.author,
                            coverUrl: selectedBookDetail.coverUrl,
                            directUrl: selectedBookDetail.key.startsWith('/works')
                              ? `https://openlibrary.org${selectedBookDetail.key}`
                              : undefined,
                            pages: selectedBookDetail.pages,
                            description: selectedBookDetail.description,
                          })
                        }
                        className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Open New Session Box</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
};
