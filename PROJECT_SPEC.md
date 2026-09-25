# Books and Friends App - Project Specification Note
**ပရောဂျက် အသေးစိတ် သတ်မှတ်ချက် မှတ်စု (Official Project Specification Note)**

- **Document Version:** 1.2.0  
- **Project Name:** Books and Friends App (Web App)  
- **Backend Infrastructure:** Supabase (PostgreSQL / Auth / Storage / Row-Level Security)  
- **External Integration:** Open Library API (REST)  
- **Frontend Stack:** React (Vite) + TypeScript + Tailwind CSS  
- **Date Recorded:** 2026-09-24  
- **Status:** Specification Recorded & Confirmed (မှတ်တမ်းတင်ပြီးစီး)  

---

## 🇲🇲 အပိုင်း (၁) - မူရင်း သတ်မှတ်ချက် မှတ်စု (Official Specification Note in Myanmar)

### ၁။ Project Overview & Objectives (ပရောဂျက် ခြုံငုံသုံးသပ်ချက်နှင့် ရည်ရွယ်ချက်)
- **App Name:** Books and Friends App (Web App)
- **Backend:** Supabase
- **Core Goal:** Web app တစ်ခု တည်ဆောက်ရန်၊ Supabase Backend နှင့် ချိတ်ဆက်ရန်၊ Open Library API ကို အသုံးပြု၍ On-Demand Data Fetching ပြုလုပ်ရန်နှင့် Reading Sessions များ ဖန်တီးနိုင်ရန်။
- **Workflow:** `Input → Network → Process → Output` (Process အလုပ်များ မလုပ်ခင် Network နှင့် External Service ကို ချိတ်ဆက်ဆောင်ရွက်မည်)။

---

### ၂။ Authentication & Security (အကောင့်စနစ်နှင့် လုံခြုံရေး)
- **Mail Validation:** Book & Friend ထဲမှ Book Club Mail နှင့် Library Mail တို့သည် တူညီမှုရှိရမည်။
- **Show/Hide Password:** Account Signup / Signin ပြုလုပ်ချိန်နှင့် Password ရိုက်ထည့်ချိန်တွင် စာလုံးများကို `***` ပုံစံဖြင့် ပြသမည်ဖြစ်ပြီး၊ "Show password" ခလုတ်ကို နှိပ်မှသာ Password စာလုံးများကို မြင်တွေ့ရမည်။
- **Developer Admin Access:**
  - သာမန် User ၏ အကောင့်များကို နောက်ကွယ်မှ ဝင်ရောက်ကြည့်ရှုခြင်း မရှိစေရ။
  - Developer Admin အနေဖြင့်သာ အောက်ပါ သတ်မှတ်ထားသော Mail နှင့် Password ဖြင့် Database ကို `Insert`, `Update`, `Delete`, `Select` ပြုလုပ်ပိုင်ခွင့် ရှိရမည်။
  - **Admin Mail:** `hudson002619@outlook.com`
  - **Admin Password:** `mYZuMr4W1hjEqE0q`
  - Admin Role Password နှင့် Mail ကို User များ မမြင်ရအောင် ဖုံးကွယ်ထားရမည်။
- **Role-Based UI Restriction:** Owner (Developer Admin) ဝင်ရောက်သည့်အခါမှသာ Data များကို စီမံခန့်ခွဲနိုင်မည့် ခလုတ်များကို မြင်တွေ့ရမည်ဖြစ်ပြီး၊ အခြားအသုံးပြုသူ အသစ်များအနေဖြင့် Admin ၏ ခလုတ်များနှင့် လုပ်ပိုင်ခွင့်များကို မြင်တွေ့ခြင်း၊ ပြုပြင်ခြင်း လုံးဝ မရှိစေရ။

---

### ၃။ Open Library API Integration & Features (Open Library ချိတ်ဆက်မှု)
- **Library Button:** Library ကို နှိပ်လိုက်ပါက Open Library API နှင့် ချိတ်ဆက်ကာ Open Library ၏ UI / Website သို့ ရောက်ရှိမည်။ (Browser Tab ပိတ်လိုက်ရင်တောင် Library ဟာ Book Club App ထဲမှာ အလုပ်လုပ်နေရမည်။)
- **API Endpoints & Integration Steps:**
  1. **Search & Autocomplete API:**
     - Endpoint: `https://openlibrary.org/search.json?q={query}`
     - Real-time ဖြင့် စာအုပ်နှင့် စာရေးဆရာနာမည်များကို ရှာဖွေနိုင်မည်။
  2. **Books / Works API:**
     - Endpoint (ISBN): `https://openlibrary.org/isbn/{ISBN}.json`
     - Endpoint (Key): `https://openlibrary.org/works/{Key}.json`
     - စာအုပ်၏ အကျဉ်းချုပ်၊ ထုတ်ဝေသည့်နှစ်နှင့် စာမျက်နှာအရေအတွက် စသည့် အသေးစိတ်အချက်အလက်များကို ဆွဲထုတ်ပြသမည်။
  3. **Covers API:**
     - Endpoint: `https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg` (အသေးအတွက် 'S', အလတ်အတွက် 'M', အကြီးအတွက် 'L' သုံးနိုင်သည်)
     - စာအုပ်မျက်နှာဖုံးပုံများကို တိုက်ရိုက် လင့်ခ်ချိတ်သုံးမည်။
  4. **Local Database Caching:**
     - API မှ ခေါ်ယူထားသော စာအုပ်ဒေတာများကို Local Database / Cache တွင် ခဏသိမ်းဆည်းခြင်း (Caching) ပြုလုပ်၍ App ပိုမိုမြန်ဆန်စေရန် ဆောင်ရွက်မည်။

---

### ၄။ Reading Session Feature (စာဖတ်ခြင်း စက်ရှင်များ ဖန်တီးခြင်း)
- Open Library တွင် Signup ပြုလုပ်ပြီးနောက် မိမိဖတ်ချင်သော စာအုပ်ကို နှိပ်လိုက်ပါက "New Session Box" ကျလာမည်။
- **Start a Reading Session Options:**
  - Quick pick popular books (လူကြိုက်များသော စာအုပ်များ အမြန်ရွေးရန်)
  - Book Title (စာအုပ်အမည် - Required)
  - Author (စာရေးဆရာ - Required)
  - Total Chapters (အခန်းအရေအတွက် စုစုပေါင်း - Required)
  - Target finish Date (Optional - ပြီးဆုံးရန် ရည်မှန်းရက်)
  - Borrow status (Borrow လုပ်ထားသော စာအုပ်များအတွက် ပေါ်နေရမည်)
  - Book Cover Artwork URL (Optional - စာအုပ်မျက်နှာဖုံးပုံ URL)
  - Direct Book URL (Optional - စာအုပ်ရှိရာ စာမျက်နှာဆီသို့ တိုက်ရိုက်ရောက်ရှိရန်)
  - Club Note / Reading synopsis (Optional - စာဖတ်အသင်း မှတ်ချက် သို့မဟုတ် အကျဉ်းချုပ်)
- **Session Display:** Create ပြုလုပ်လိုက်သော Reading Session တွင် Total Chapters, Hosted by [Username], Invite Code, စာအုပ်အဖုံး၊ စာအုပ်အမည်နှင့် စာရေးဆရာနာမည်များ အပြည့်အစုံ ပေါ်လာရမည်။

---

### ၅။ Supabase Configuration & Admin SQL Schema
- **Supabase Project Credentials:**
  - Project ID: `[*****]`
  - SUPABASE_URL: `[https:*****]`
  - SUPABASE_PUBLISHABLE_KEY: `[*****]`
  - SUPABASE_SECRET_KEY: `[******]`
  - SUPABASE_JWKS_URL: `[https://[******]`
- **Admin Role SQL Database Schema (For Supabase):**
  - Database တွင် Admin Role နှင့် User Role များကို ခွဲခြားသတ်မှတ်ရန်အတွက် SQL ကုဒ်ကို Supabase SQL Editor တွင် အသုံးပြုရန် ပြင်ဆင်ပေးထားပြီး Role-based Access Control (RBAC) အတွက် စနစ်တကျ အလုပ်လုပ်စေမည်။

---

### ၆။ User Access Boundaries & Session Join/Exit (အသုံးပြုသူ နယ်နိမိတ်နှင့် ဝင်/ထွက်ခွင့်)
- အသစ်ဝင်ရောက်လာတဲ့ User များ မိမိရဲ့ ကိုယ်ပိုင်မျက်နှာပြင်တွင်သာ ကိုယ်ပိုင်အကောင့်ဖြင့် ချိတ်ဆက်ထားသော User မျက်နှာပြင်မှ ခလုတ်များကိုသာ `Insert`, `Update`, `Delete`, `Select` လုပ်ခွင့်ရှိပြီး တခြားသူတွေရဲ့ မျက်နှာပြင်ကိုတော့ ဝင်ရောက်ပြင်ဆင်ခွင့် မရှိပါ။
- User မှ တခြားသူမှ Host လုပ်ထားသော Reading Session သို့ ဝင်ရောက် ချိတ်ဆက်နိုင်သည်။
  - Invite Code မှတစ်ဆင့်သော်လည်းကောင်း
  - Start New Reading Session တဆင့် ချိတ်ဆက်နိုင်ရမည်။
- မှားယွင်းချိတ်ဆက်မိပါကလည်း ပြန်ထွက်နိုင်ဖို့ **"Exit Session"** ခလုတ် ပါရှိရမည်။

---

### ၇။ Developer Admin Special Privileges (အက်ဒမင် အခွင့်အာဏာ)
- Web app Admin သည် ဖော်ပြပါ **Admin Mail:** `hudson002619@outlook.com` နှင့် **Admin Password:** `mYZuMr4W1hjEqE0q` ဖြင့် Login ဝင်လိုက်သောအခါ Web app တစ်ခုလုံးကို ဝင်ရောက်ပြင်ဆင်ခွင့်ရှိသော အခွင့်အာဏာ `Insert`, `Update`, `Delete`, `Select` လုပ်နိုင်ခွင့်ရှိသည်။
- Admin မှလွဲ၍ User များ ထိုသို့ အခွင့်အာဏာ မရှိရပါ။

---

### ၈။ Reader Profile & Account Management Specification (ပရိုဖိုင်နှင့် အကောင့် စီမံခန့်ခွဲမှု)
#### (က) Current Reader Profile Menu (Pop-up Component)
- **User Information Display:**
  - Username / Pseudonym (ဥပမာ - `AD2600`)
  - Email Address (ဥပမာ - `hudson002619@gmail.com`)
  - Account Status Badge: `"Demo Profile"` သို့မဟုတ် `"Verified Reader"`
- **Menu Options:**
  1. *Edit Reader Profile* - Reader Profile အချက်အလက်များကို ပြင်ဆင်ရန်။
  2. *Switch Reader Account* - အခြား အကောင့်တစ်ခုသို့ ပြောင်းလဲရန်။
  3. *Sign Out* - အကောင့်မှ ထွက်ရန် (Log out)။

#### (ခ) Reader Profile Configuration Modal / Screen
အသုံးပြုသူ၏ ကိုယ်ရေးအချက်အလက်များနှင့် အကောင့်ဆက်တင်များကို စီမံခန့်ခွဲရန် Form UI အစိတ်အပိုင်းများ ပါဝင်သည် -
- **Reader Avatar (Profile Picture) Management:**
  - Avatar ပုံစံပြသခြင်း (ဥပမာ - Robot ပုံစံ ဇာတ်ကောင်ပုံစံ)။
  - Upload Options:
    - *Upload Photo:* ဖိုင်များမှ တိုက်ရိုက်တင်ရန် (JPG, PNG, WebP $\le 5\text{MB}$)။
    - *Presets:* နမူနာပုံစံ ရွေးချယ်စရာများ။
    - *Image URL:* ပုံ၏ Direct URL ကို ထည့်သွင်းအသုံးပြုရန်။
    - *Delete/Remove Button:* ပုံကို ဖယ်ရှားရန် (Trash icon)။
- **User Statistics Summary Cards:**
  - `CLUBS: 3` (ပါဝင်ထားသော Book Clubs အရေအတွက်)
  - `COMPLETED: 0` (ပြီးမြောက်သွားသော စာအုပ်/စက်ရှင် အရေအတွက်)
  - `CHAPTERS: 0` (ဖတ်ရှုပြီးစီးသည့် အခန်းအရေအတွက်)
- **Account Details & Pseudonym:**
  - Display Name / Reader Pseudonym: သုံးစွဲသူ၏ အမည်နာမ (သို့) Pseudonym ကို ပြသခြင်း/ပြင်ဆင်ခြင်း (ဥပမာ - `AD2600`)။
- **Account Synchronization (v1.30.0):**
  - Status Badge: `"✓ Synced"`
  - Book Club Email: `hudsonexap@gmail.com`
  - Open Library Email: `hudsonexap@gmail.com`
  - Validation Note: *“Matching Mail Validated. Borrowing status & Open Library sync enabled.”* (Book Club Mail နှင့် Open Library Mail တို့ တူညီမှုရှိမှသာ Borrowing Status နှင့် Open Library Sync လုပ်ဆောင်ချက် အလုပ်လုပ်မည်။)
- **Additional Preferences & Bio:**
  - Favorite Genre: ဝါသနာပါသော စာအုပ်အမျိုးအစား (ဥပမာ - `Sci-Fi & Speculative`)။
  - Reader Bio: ကိုယ်ရေးအကျဉ်း (ဥပမာ - `Club reader on Books & Friends`)။
- **Action Buttons:**
  - *Save Profile Changes:* ပြောင်းလဲထားသော Profile အချက်အလက်များကို သိမ်းဆည်းရန် ခလုတ်။
  - *Log Out of Account:* အကောင့်မှ ထွက်ခွာရန် ခလုတ်။

#### (ဂ) Switch Reader Account ကန့်သတ်ချက် (Account Switching Rules)
- **Switch Reader Account** ကို အသုံးပြုရာတွင် User မှ **Demo အကောင့်များကိုသာ Switch လုပ်ခွင့်ရှိသည်**။
- တခြားသူရဲ့ အကောင့်များကို Switch လုပ်ခွင့် မရှိပါ။
- User သည် မိမိအကောင့်နှင့် Demo အကောင့်များကိုသာ ရွှေ့ပြောင်းခွင့်ရှိပြီး တခြားသူတွေရဲ့ အကောင့်တွေကလည်း ထိုသို့သာဖြစ်သည်။ အသုံးပြုသူသည် မိမိကိုယ်ပိုင်အကောင့်နှင့် Demo အကောင့်များမှလွဲ၍ Switch လုပ်ခွင့် လုံးဝ မရှိစေရ။

---

## 🇬🇧 အပိုင်း (၂) - Technical Implementation & Schema Details

### 1. Data Flow Architecture
```
[ User Input / Interaction ]
            ↓
[ Network Connectivity & Service Health Check ]
  - Supabase Health Ping
  - Open Library REST API Ping
            ↓
[ Business Logic & Authorization Process ]
  - Mail Matching Validation (Book Club Mail == Library Mail)
  - Role-Based Access Control (Admin vs Regular User vs Demo Profile)
  - Open Library Local Database Cache Inspection
            ↓
[ UI Render / Output State ]
  - Reading Sessions Feed (Invite code, Host, Artwork, Chapters)
  - Admin Management Console (HUDSON Admin only)
  - Synchronized Reader Profile Modal
```

### 2. Supabase SQL Schema & Row Level Security (RLS)
The following schema defines RBAC, user profiles, reading sessions, session memberships, and book caching:

```sql
-- 1. Profiles Table with Role Definition
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

-- 3. Session Memberships Table
CREATE TABLE IF NOT EXISTS public.session_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.reading_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_chapter INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- 4. Book Cache Table (Open Library Cache)
CREATE TABLE IF NOT EXISTS public.book_cache (
  key TEXT PRIMARY KEY, -- e.g., work key or ISBN
  title TEXT NOT NULL,
  author TEXT,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Helper Function: Check if user is Developer Admin
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

-- 6. Enable Row Level Security (RLS)
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

-- 8. RLS Policies: Reading Sessions
CREATE POLICY "Read sessions"
  ON public.reading_sessions FOR SELECT
  USING (true);

CREATE POLICY "Users can create sessions"
  ON public.reading_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id OR public.is_admin());

CREATE POLICY "Host or Admin can update sessions"
  ON public.reading_sessions FOR UPDATE
  USING (auth.uid() = host_id OR public.is_admin());

CREATE POLICY "Host or Admin can delete sessions"
  ON public.reading_sessions FOR DELETE
  USING (auth.uid() = host_id OR public.is_admin());

-- 9. RLS Policies: Session Members
CREATE POLICY "Read members"
  ON public.session_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join sessions"
  ON public.session_members FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update progress or leave"
  ON public.session_members FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can exit session"
  ON public.session_members FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 10. Book Cache Policies
CREATE POLICY "Anyone can read cached books"
  ON public.book_cache FOR SELECT USING (true);

CREATE POLICY "Authenticated users or admin can cache books"
  ON public.book_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());
```

---

## ၃။ အတည်ပြုချက်နှင့် လက်ရှိ အခြေအနေ (Official Completion Notes & Milestones)

အသုံးပြုသူ၏ သတ်မှတ်ချက်အရ အောက်ဖော်ပြပါ အစီအစဉ်အားလုံးကို အောင်မြင်စွာ အကောင်အထည်ဖော် တည်ဆောက်ပြီးစီးကြောင်း တရားဝင် မှတ်တမ်းတင် အတည်ပြုပါသည် -

1. **အစီအစဉ် (၁) နှင့် (၂) ပြီးစီးမှု:**  
   Books and Friends App အတွက် Project Specification အစီအစဉ် (၁) [Project Overview & Workflow] နှင့် (၂) [Authentication, Mail Validation & Security] ကို အောင်မြင်စွာ စတင်တည်ဆောက်ပြီးစီးသွားပါပြီ။

2. **အစီအစဉ် (၃) နှင့် (၄) ပြီးစီးမှု:**  
   Project Specification ၏ အစီအစဉ် (၃) Open Library API Integration & Features နှင့် အစီအစဉ် (၄) Reading Session Feature တို့ကို အောင်မြင်စွာ စတင်အကောင်အထည်ဖော် ထည့်သွင်းပြီးဖြစ်ပါသည်။

3. **အစီအစဉ် (၅) နှင့် (၆) ပြီးစီးမှု:**  
   Project Specification Note ပါ အစီအစဉ် ၅ (Supabase Configuration & Admin SQL Schema) နှင့် အစီအစဉ် ၆ (User Access Boundaries & Session Management) တို့ကို အောင်မြင်စွာ တည်ဆောက်အကောင်အထည်ဖော်ပြီး ဖြစ်ပါသည်။

4. **အစီအစဉ် (၇) နှင့် (၈) ပြီးစီးမှု:**  
   Project Spec Note ပါ အစီအစဉ် ၇ (Admin Privileges) နှင့် အစီအစဉ် ၈ (Reader Profile & Account Management Specification) တို့အား စနစ်တကျ အပြည့်အစုံ ရေးသားတည်ဆောက် ပြီးစီးပါပြီ။

5. **ကုဒ်သန့်စင်မှုနှင့် VS Code / Supabase ချိတ်ဆက်မှု (Final Milestone):**  
   - Boilerplate နှင့် မလိုအပ်သော ကုဒ်အတိုအစများ (Unused Imports & Dead Functions) အားလုံးကို ရှင်းလင်းပြီး Clean & Bug-free ဖြစ်စေခြင်း။
   - VS Code တွင် ဖွင့်ပြီး တိုက်ရိုက် Run နိုင်သည့် Full-stack Web Project အဖြစ် အသင့်ထုပ်ပိုးပေးထားခြင်း။
   - UI ထဲမှဖြစ်စေ၊ ဖိုင်စနစ်ထဲမှဖြစ်စေ ဒေါင်းလုဒ်ရယူနိုင်သော `.zip` package ပြုလုပ်ပေးထားခြင်း။
   - Supabase Database Server ချိတ်ဆက်မှု လမ်းညွှန် (Supabase Server Connection Guide & SQL Schema) ကို စုံလင်စွာ ထည့်သွင်းပေးထားခြင်း။

