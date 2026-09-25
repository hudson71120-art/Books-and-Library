# Books and Friends App 📚✨

A full-stack book club and reading session web application built with **React 19**, **TypeScript**, **Tailwind CSS**, **Vite**, **Open Library REST API**, and **Supabase (PostgreSQL + RBAC)**.

---

## 🚀 Quick Start for VS Code

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Database & SQL Schema Setup

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> Click **New Query**.
3. Copy the complete SQL script from `supabase-schema.sql` and click **Run**.
4. Set your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (or via the **Architecture Pipeline -> Supabase Credentials** button in the app).

For the full detailed setup instructions in Myanmar, see [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md).

---

## 🔐 Developer Admin Credentials
- **Admin Email:** `hudson002619@outlook.com`
- **Admin Password:** `mYZuMr4W1hjEqE0q`
*(Exclusive global INSERT / UPDATE / DELETE / SELECT access across all database tables).*

---

## 📖 Key Specifications Implemented
1. **Workflow Pipeline:** `Input → Network → Process → Output`.
2. **Matching Mail Validation:** Synchronizes Book Club Mail & Open Library Mail.
3. **Open Library Integration:** Live Search, ISBN/Works API details, Covers API (S/M/L), and local database caching.
4. **Reading Sessions:** Host creation, invite codes (e.g., `BF-XXXX`), borrow status, and **Exit Session** button.
5. **Role-Based Access Control:** Developer Admin exclusive management console, isolated user profiles, and Demo account switching.
