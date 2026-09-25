export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
  edition_count?: number;
  publisher?: string[];
}

export interface CachedBookData {
  key: string; // works key or isbn
  isbn?: string;
  title: string;
  author: string;
  firstPublishYear?: number;
  coverUrl?: string;
  description?: string;
  pages?: number;
  cachedAt: string;
  subjects?: string[];
}

const STORAGE_CACHE_KEY = 'bf_openlibrary_cache';

/**
 * Retrieve cached books from local database cache
 */
export function getCachedBooks(): Record<string, CachedBookData> {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading book cache', e);
  }
  return {};
}

/**
 * Store book data into local database cache for fast retrieval and offline availability
 */
export function cacheBookData(book: CachedBookData): void {
  try {
    const cache = getCachedBooks();
    cache[book.key] = book;
    if (book.isbn) {
      cache[`isbn_${book.isbn}`] = book;
    }
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Error writing book cache', e);
  }
}

/**
 * Open Library Real-Time Search & Autocomplete API
 * Endpoint: https://openlibrary.org/search.json?q={query}
 */
export async function searchOpenLibrary(query: string, limit: number = 10): Promise<OpenLibraryDoc[]> {
  if (!query || query.trim().length === 0) return [];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open Library search failed with status: ${response.status}`);
  }
  const data = await response.json();
  return data.docs || [];
}

/**
 * Open Library Works API
 * Endpoint: https://openlibrary.org/works/{Key}.json
 * Fetches detailed information including summaries, subjects, and description
 */
export async function fetchWorkDetails(workKey: string, authorHint?: string): Promise<CachedBookData | null> {
  const cache = getCachedBooks();
  if (cache[workKey]) {
    return cache[workKey];
  }

  try {
    const cleanKey = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
    const url = `https://openlibrary.org${cleanKey}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    let desc = '';
    if (typeof data.description === 'string') {
      desc = data.description;
    } else if (data.description && typeof data.description.value === 'string') {
      desc = data.description.value;
    }

    const coverId = data.covers?.[0];
    const coverUrl = coverId ? getCoverImageUrl(coverId, undefined, 'L') : undefined;

    const cached: CachedBookData = {
      key: workKey,
      title: data.title || 'Untitled',
      author: authorHint || 'Open Library Author',
      firstPublishYear: data.first_publish_date ? parseInt(data.first_publish_date) : undefined,
      coverUrl: coverUrl,
      description: desc || 'Classic work cataloged in Open Library open archive.',
      subjects: Array.isArray(data.subjects) ? data.subjects.slice(0, 6) : undefined,
      cachedAt: new Date().toISOString(),
    };

    cacheBookData(cached);
    return cached;
  } catch (err) {
    console.warn('Failed to fetch Open Library work details', err);
    return null;
  }
}

/**
 * Open Library Books / ISBN API
 * Endpoint: https://openlibrary.org/isbn/{ISBN}.json
 * Fetches page counts, publication dates, and book metadata by ISBN
 */
export async function fetchBookByIsbn(isbn: string): Promise<CachedBookData | null> {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
  if (!cleanIsbn) return null;

  const cache = getCachedBooks();
  const cacheKey = `isbn_${cleanIsbn}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const url = `https://openlibrary.org/isbn/${cleanIsbn}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    let desc = '';
    if (typeof data.description === 'string') {
      desc = data.description;
    } else if (data.description && typeof data.description.value === 'string') {
      desc = data.description.value;
    }

    const cached: CachedBookData = {
      key: cleanIsbn,
      isbn: cleanIsbn,
      title: data.title || 'Untitled',
      author: data.by_statement || 'Cataloged Author',
      firstPublishYear: data.publish_date ? parseInt(data.publish_date) : undefined,
      coverUrl: getCoverImageUrl(undefined, cleanIsbn, 'L'),
      description: desc || 'Cataloged edition with verified Open Library ISBN.',
      pages: data.number_of_pages,
      cachedAt: new Date().toISOString(),
    };

    cacheBookData(cached);
    return cached;
  } catch (err) {
    console.warn('Failed to fetch Open Library ISBN details', err);
    return null;
  }
}

/**
 * Open Library Covers API
 * Endpoints:
 * - https://covers.openlibrary.org/b/isbn/{ISBN}-{size}.jpg
 * - https://covers.openlibrary.org/b/id/{cover_i}-{size}.jpg
 * Sizes: 'S' (Small), 'M' (Medium), 'L' (Large)
 */
export function getCoverImageUrl(
  coverId?: number,
  isbn?: string,
  size: 'S' | 'M' | 'L' = 'M'
): string {
  if (coverId && coverId > 0) {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }
  if (isbn && isbn.trim().length > 0) {
    const clean = isbn.trim().replace(/[^0-9X]/gi, '');
    if (clean) {
      return `https://covers.openlibrary.org/b/isbn/${clean}-${size}.jpg`;
    }
  }
  return '/src/assets/images/book_cover_speculative_1790311206408.jpg';
}
