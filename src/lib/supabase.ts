import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ReadingSession, SupabaseConfig, UserProfile } from '../types';

const STORAGE_KEY_CONFIG = 'bf_supabase_config';
const STORAGE_KEY_SESSIONS = 'bf_sessions_cache';

// Developer Admin Constant Credentials
export const ADMIN_EMAIL = 'hudson002619@outlook.com';
export const ADMIN_PASSWORD = 'mYZuMr4W1hjEqE0q';

// Default configuration matching project credentials schema & Vite env vars
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const envProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';

const DEFAULT_CONFIG: SupabaseConfig = {
  projectId: envProjectId || 'vkmjrqvxtlmbnyvjqkta',
  url: envUrl || 'https://vkmjrqvxtlmbnyvjqkta.supabase.co',
  anonKey: envAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key_for_client_interface',
  secretKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.service_role_secret_key_mock',
  jwksUrl: envUrl ? `${envUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json` : 'https://vkmjrqvxtlmbnyvjqkta.supabase.co/auth/v1/.well-known/jwks.json',
  isConnected: Boolean(envUrl && envAnonKey && !envAnonKey.includes('mock_key')),
};

export const SUPABASE_RBAC_SQL_SCHEMA = `-- ========================================================
-- Supabase Role-Based Access Control (RBAC) Database Schema
-- Run in Supabase Dashboard -> SQL Editor
-- Target: Books and Friends App (Section 5)
-- ========================================================

-- 1. Profiles Table with RBAC (Admin vs User Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  open_library_email TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Club reader on Books & Friends',
  favorite_genre TEXT DEFAULT 'Sci-Fi & Speculative',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Reading Sessions Table
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  book_title TEXT NOT NULL,
  author TEXT NOT NULL,
  total_chapters INT NOT NULL CHECK (total_chapters > 0),
  target_date DATE,
  borrow_status BOOLEAN DEFAULT false,
  cover_url TEXT,
  direct_url TEXT,
  club_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Session Memberships Table (Joined Sessions & Tracking)
CREATE TABLE IF NOT EXISTS public.session_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.reading_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_chapter INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- 4. Book Cache Table (Open Library Metadata Caching)
CREATE TABLE IF NOT EXISTS public.book_cache (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Helper Function: Developer Admin Verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'hudson002619@outlook.com'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_cache ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Profiles
CREATE POLICY "Public read user profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin has full profile control"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 8. RLS Policies: Reading Sessions (User Access Boundaries Enforced)
-- Newly arriving users can only Insert, Update, Delete using buttons on their own UI
CREATE POLICY "Public read reading sessions"
  ON public.reading_sessions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create sessions"
  ON public.reading_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id OR public.is_admin());

CREATE POLICY "Host or Admin can update sessions"
  ON public.reading_sessions FOR UPDATE
  USING (auth.uid() = host_id OR public.is_admin());

CREATE POLICY "Host or Admin can delete sessions"
  ON public.reading_sessions FOR DELETE
  USING (auth.uid() = host_id OR public.is_admin());

-- 9. RLS Policies: Session Members (Join & Exit Management)
CREATE POLICY "Read session members"
  ON public.session_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join sessions"
  ON public.session_members FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update progress in their joined sessions"
  ON public.session_members FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can exit sessions"
  ON public.session_members FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 10. RLS Policies: Book Cache
CREATE POLICY "Anyone can read cached books"
  ON public.book_cache FOR SELECT USING (true);

CREATE POLICY "Authenticated users or admin can cache books"
  ON public.book_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());
`;

let cachedClient: SupabaseClient | null = null;

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading Supabase config from storage', err);
  }
  return DEFAULT_CONFIG;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    cachedClient = null; // reset cached client instance
  } catch (err) {
    console.error('Error saving Supabase config to storage', err);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey && !config.anonKey.includes('mock_key')) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return cachedClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client with given credentials', e);
    }
  }
  return null;
}

/**
 * Test network connectivity to Supabase backend
 */
export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{
  success: boolean;
  message: string;
  latencyMs: number;
}> {
  const targetConfig = config || getStoredSupabaseConfig();
  const startTime = performance.now();

  try {
    if (!targetConfig.url || !targetConfig.url.startsWith('http')) {
      return {
        success: false,
        message: 'Invalid Supabase URL format.',
        latencyMs: 0,
      };
    }

    // Ping the Supabase REST health endpoint or public root
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const pingUrl = `${targetConfig.url.replace(/\/$/, '')}/rest/v1/`;
    const res = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        apikey: targetConfig.anonKey,
      },
      signal: controller.signal,
    }).catch(async () => {
      // Fallback check to auth endpoint
      return await fetch(`${targetConfig.url.replace(/\/$/, '')}/auth/v1/health`, {
        signal: controller.signal,
      });
    });

    clearTimeout(timeout);
    const latency = Math.round(performance.now() - startTime);

    if (res && (res.status === 200 || res.status === 401 || res.status === 404)) {
      // 401/404 means the Supabase host exists and responds to HTTP requests
      return {
        success: true,
        message: `Connected to Supabase endpoint (${res.status} OK)`,
        latencyMs: latency,
      };
    }

    return {
      success: false,
      message: `Supabase host responded with status ${res?.status || 'Unknown'}`,
      latencyMs: latency,
    };
  } catch (error: unknown) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection timed out or network blocked',
      latencyMs: latency,
    };
  }
}

/**
 * Initial curated sample reading sessions
 */
export const INITIAL_SESSIONS: ReadingSession[] = [
  {
    id: 'sess-001',
    hostId: 'admin-001',
    hostName: 'Admin Curator',
    inviteCode: 'BF-8801',
    bookTitle: 'The Chronos Fragment',
    author: 'Elena Vance',
    totalChapters: 24,
    targetFinishDate: '2026-11-15',
    borrowStatus: true,
    coverArtworkUrl: '/src/assets/images/book_cover_speculative_1790311206408.jpg',
    directBookUrl: 'https://openlibrary.org/works/OL1802W',
    clubNote: 'Speculative fiction exploring temporal anomalies and memory architecture.',
    createdAt: new Date().toISOString(),
    membersCount: 14,
  },
  {
    id: 'sess-002',
    hostId: 'demo-user-1',
    hostName: 'AD2600',
    inviteCode: 'BF-4520',
    bookTitle: 'Echoes of the High Plateau',
    author: 'Julian M. Thorne',
    totalChapters: 18,
    targetFinishDate: '2026-10-30',
    borrowStatus: false,
    coverArtworkUrl: '/src/assets/images/book_cover_classic_1790311217959.jpg',
    directBookUrl: 'https://openlibrary.org/works/OL849201W',
    clubNote: 'Quiet prose reflecting on mountain communities and changing seasons.',
    createdAt: new Date().toISOString(),
    membersCount: 8,
  },
  {
    id: 'sess-003',
    hostId: 'demo-user-2',
    hostName: 'Clara_Reads',
    inviteCode: 'BF-9102',
    bookTitle: 'Letters from the Midnight Archives',
    author: 'M. S. Althaus',
    totalChapters: 30,
    targetFinishDate: '2026-12-01',
    borrowStatus: true,
    coverArtworkUrl: '/src/assets/images/book_cover_curated_1790311230114.jpg',
    directBookUrl: 'https://openlibrary.org/works/OL734199W',
    clubNote: 'Historical epistolary mystery based on forgotten observatory diaries.',
    createdAt: new Date().toISOString(),
    membersCount: 19,
  },
];

/**
 * Local synced database repository for reading sessions
 */
export function getReadingSessions(): ReadingSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading reading sessions', e);
  }
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  return INITIAL_SESSIONS;
}

export function saveReadingSessions(sessions: ReadingSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving reading sessions', e);
  }
}

/**
 * Developer Admin Authorized Database CRUD operations
 * Regular users cannot execute these global administrative mutations.
 */
export async function adminInsertSession(
  session: Omit<ReadingSession, 'id' | 'createdAt'>,
  requesterEmail: string
): Promise<{ success: boolean; data?: ReadingSession; error?: string }> {
  if (requesterEmail !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized: Only Developer Admin can execute global insertions.' };
  }

  const newSession: ReadingSession = {
    ...session,
    id: `sess-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const sessions = getReadingSessions();
  sessions.unshift(newSession);
  saveReadingSessions(sessions);

  // If live Supabase client is connected, sync to remote
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('reading_sessions').insert([{
        invite_code: newSession.inviteCode,
        book_title: newSession.bookTitle,
        author: newSession.author,
        total_chapters: newSession.totalChapters,
        target_date: newSession.targetFinishDate,
        borrow_status: newSession.borrowStatus,
        cover_url: newSession.coverArtworkUrl,
        direct_url: newSession.directBookUrl,
        club_note: newSession.clubNote,
      }]);
    } catch (err) {
      console.warn('Remote Supabase insert notice:', err);
    }
  }

  return { success: true, data: newSession };
}

export async function adminUpdateSession(
  id: string,
  updates: Partial<ReadingSession>,
  requesterEmail: string
): Promise<{ success: boolean; data?: ReadingSession; error?: string }> {
  if (requesterEmail !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized: Only Developer Admin can update arbitrary records.' };
  }

  const sessions = getReadingSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, error: 'Session record not found.' };
  }

  sessions[index] = { ...sessions[index], ...updates };
  saveReadingSessions(sessions);

  return { success: true, data: sessions[index] };
}

export async function adminDeleteSession(
  id: string,
  requesterEmail: string
): Promise<{ success: boolean; error?: string }> {
  if (requesterEmail !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized: Only Developer Admin can delete database records.' };
  }

  const sessions = getReadingSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  saveReadingSessions(filtered);

  return { success: true };
}

export async function adminSelectAllData(
  requesterEmail: string
): Promise<{ success: boolean; data?: { sessions: ReadingSession[]; usersCount: number }; error?: string }> {
  if (requesterEmail !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized: Regular users are prohibited from querying backend data.' };
  }

  const sessions = getReadingSessions();
  return {
    success: true,
    data: {
      sessions,
      usersCount: 3,
    },
  };
}

/**
 * User Access Boundary Operations (Section 6)
 * Newly arriving users can only Insert, Update, Delete, and Select data using buttons on their own user interface
 * connected to their personal accounts. They have no permission to access or modify other users' interfaces.
 */

export function getUserJoinedSessionIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`bf_joined_sessions_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading joined session IDs', e);
  }
  // Default demo joined sessions for initial showcase
  return ['sess-001', 'sess-002'];
}

export function saveUserJoinedSessionIds(userId: string, sessionIds: string[]): void {
  try {
    localStorage.setItem(`bf_joined_sessions_${userId}`, JSON.stringify(sessionIds));
  } catch (e) {
    console.error('Error saving joined session IDs', e);
  }
}

export async function userUpdateOwnSession(
  sessionId: string,
  updates: Partial<ReadingSession>,
  currentUser: UserProfile
): Promise<{ success: boolean; data?: ReadingSession; error?: string }> {
  const sessions = getReadingSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return { success: false, error: 'Session record not found.' };
  }

  const session = sessions[index];
  const isHost = session.hostId === currentUser.id || session.hostName === currentUser.username;
  const isAdminUser = currentUser.bookClubEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isHost && !isAdminUser) {
    return {
      success: false,
      error: 'Permission Denied: User access boundary enforced. You can only modify reading sessions you have personally hosted.',
    };
  }

  sessions[index] = {
    ...session,
    ...updates,
    totalChapters: updates.totalChapters ? Number(updates.totalChapters) : session.totalChapters,
  };
  saveReadingSessions(sessions);
  return { success: true, data: sessions[index] };
}

export async function userDeleteOwnSession(
  sessionId: string,
  currentUser: UserProfile
): Promise<{ success: boolean; error?: string }> {
  const sessions = getReadingSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return { success: false, error: 'Session record not found.' };
  }

  const isHost = session.hostId === currentUser.id || session.hostName === currentUser.username;
  const isAdminUser = currentUser.bookClubEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isHost && !isAdminUser) {
    return {
      success: false,
      error: 'Permission Denied: User access boundary enforced. You cannot delete reading sessions created by other readers.',
    };
  }

  const filtered = sessions.filter((s) => s.id !== sessionId);
  saveReadingSessions(filtered);
  return { success: true };
}
