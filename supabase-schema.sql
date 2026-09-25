-- ========================================================
-- Books and Friends App: Complete Supabase RBAC SQL Schema
-- Target: Supabase Dashboard -> SQL Editor -> Run
-- Features:
--   1. profiles (RBAC: 'admin' vs 'user', avatar, stats)
--   2. reading_sessions (Host boundary, Invite Code, Open Library Borrow)
--   3. session_members (Progress tracking, Join & Exit Session)
--   4. book_cache (Local & Remote Open Library Cache)
--   5. public.is_admin() (Developer Admin Role Check)
--   6. Row Level Security (RLS) Policies
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
  clubs_count INT DEFAULT 1,
  completed_books_count INT DEFAULT 0,
  chapters_read_count INT DEFAULT 0,
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

-- 3. Session Memberships Table (Joined Circles & Progress Tracking)
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
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT,
  first_publish_year INT,
  cover_url TEXT,
  pages INT,
  data JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Helper Function: Developer Admin Verification
-- Developer Admin Email: hudson002619@outlook.com
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

-- ========================================================
-- Optional Initial Seed Data
-- ========================================================
-- You can run this after setting up your first admin user or profiles:
-- INSERT INTO public.reading_sessions (invite_code, book_title, author, total_chapters, borrow_status)
-- VALUES ('BF-8801', 'The Chronos Fragment', 'Elena Vance', 24, true);
