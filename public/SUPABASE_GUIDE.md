# Books and Friends App - Supabase Database Server Connection & VS Code Setup Guide
**🇲🇲 မြန်မာဘာသာဖြင့် အသေးစိတ် တပ်ဆင်အသုံးပြုနည်း လမ်းညွှန်**

ဤလမ်းညွှန်သည် **Books and Friends App** ကို မိမိ၏ ကွန်ပျူတာ (VS Code) တွင် အောင်မြင်စွာ Run နိုင်ရန်နှင့် မိမိ၏ **Supabase Database Server** နှင့် ချိတ်ဆက်အသုံးပြုနိုင်ရန် အဆင့်ဆင့် ရှင်းပြထားပါသည်။

---

## အပိုင်း (၁) - VS Code တွင် ဖွင့်ပြီး စတင် Run နည်း (Local Setup)

### ၁။ လိုအပ်သော ဆော့ဖ်ဝဲလ်များ (Prerequisites)
- [Node.js](https://nodejs.org/) (Version 18 သို့မဟုတ် 20+)
- [VS Code](https://code.visualstudio.com/)
- Git (သို့မဟုတ် Download လုပ်ထားသော Zip ဖိုင်)

### ၂။ Project ဖိုင်များ ဖွင့်လှစ်ခြင်း
1. ဒေါင်းလုဒ်လုပ်ထားသော `books-and-friends-app.zip` ဖိုင်ကို Extract လုပ်ပါ။ (Zip ဖြည်ပါ)
2. **VS Code** ကို ဖွင့်ပြီး **File -> Open Folder...** မှတစ်ဆင့် Zip ဖြည်ထားသော folder ကို ရွေးချယ်ဖွင့်ပါ။
3. VS Code တွင် Terminal အသစ်ဖွင့်ပါ (**Ctrl + `** သို့မဟုတ် **Terminal -> New Terminal**).

### ၃။ Dependencies များ သွင်းယူခြင်း
Terminal တွင် အောက်ပါ command ကို ရိုက်နှိပ်ပါ:
```bash
npm install
```

### ၄။ Environment Variable (.env) ပြင်ဆင်ခြင်း
ပရောဂျက် root ထဲရှိ `.env.example` ဖိုင်ကို copy ကူးပြီး `.env` အမည်ဖြင့် ဖိုင်အသစ် ပြုလုပ်ပါ:
```bash
cp .env.example .env
```
(Windows PowerShell တွင် `copy .env.example .env`)

### ၅။ Development Server စတင်ခြင်း
Terminal တွင် အောက်ပါ command ဖြင့် run ပါ:
```bash
npm run dev
```
Run ပြီးပါက Terminal တွင် `http://localhost:3000` (သို့မဟုတ် အခြား port) ပေါ်လာမည်ဖြစ်ပြီး Browser တွင် ဖွင့်လှစ် အသုံးပြုနိုင်ပါပြီ။

---

## အပိုင်း (၂) - Supabase Database Server ချိတ်ဆက်ခြင်း

### အဆင့် ၁: Supabase Account နှင့် Project အသစ် ပြုလုပ်ခြင်း
1. [https://supabase.com](https://supabase.com) သို့ သွားရောက်ပြီး **Sign In / Sign Up** ပြုလုပ်ပါ။
2. **New Project** ခလုတ်ကို နှိပ်ပါ။
3. မိမိ ပရောဂျက်အတွက် အောက်ပါတို့ကို ဖြည့်စွက်ပါ:
   - **Name:** `Books and Friends`
   - **Database Password:** ခိုင်မာသော Password တစ်ခု သတ်မှတ်ပြီး မှတ်ထားပါ။
   - **Region:** မိမိနှင့် အနီးဆုံးဒေသ (ဥပမာ - `Southeast Asia (Singapore)`) ကို ရွေးပါ။
4. **Create new project** ကို နှိပ်ပြီး Database ဖန်တီးချိန် ခဏစောင့်ပါ။ (၁-၂ မိနစ်ခန့်)

### အဆင့် ၂: API Credentials များ ရယူခြင်း
1. Supabase Dashboard ၏ ဘယ်ဘက် မီနူးအောက်ခြေရှိ **Project Settings (ဂီယာပုံသင်္ကေတ)** -> **API** သို့ သွားပါ။
2. အောက်ပါ အချက် ၃ ချက်ကို ကူးယူပါ:
   - **Project URL:** (ဥပမာ - `https://abcdefghijklmnop.supabase.co`)
   - **Project API Keys (anon / public):** `eyJhbGciOi...` စသည့် key
   - **Reference ID (Project ID):** URL ရှေ့ပိုင်းစာလုံးများ

### အဆင့် ၃: `.env` ဖိုင်တွင် ထည့်သွင်းခြင်း
မိမိ၏ `.env` ဖိုင်ထဲတွင် အောက်ပါအတိုင်း အစားထိုး ထည့်သွင်းပါ:
```env
VITE_SUPABASE_PROJECT_ID="မိမိ၏_PROJECT_ID"
VITE_SUPABASE_URL="https://မိမိ၏_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="မိမိ၏_ANON_KEY"
```

> **မှတ်ချက်:** အကယ်၍ `.env` မပြင်ချင်ပါက App ကို Run ပြီး မျက်နှာပြင်ပေါ်ရှိ **"Architecture Pipeline"** မှ **"Supabase Credentials"** ခလုတ်ကို နှိပ်ကာ တိုက်ရိုက် ရိုက်ထည့်၍လည်း ချိတ်ဆက်နိုင်ပါသည်။

---

## အပိုင်း (၃) - Database Schema နှင့် RBAC စနစ် တည်ဆောက်ခြင်း

Books and Friends App တွင် Developer Admin နှင့် User အခန်းကဏ္ဍများကို ခွဲခြားထားသော Role-Based Access Control (RBAC) ပါရှိပါသည်။

1. Supabase Dashboard သို့ ပြန်သွားပြီး ဘယ်ဘက် မီနူးမှ **SQL Editor** ကို နှိပ်ပါ။
2. **New query** (အသစ်တစ်ခု) ဖွင့်ပါ။
3. ဤပရောဂျက် root ထဲရှိ **`supabase-schema.sql`** ဖိုင်ထဲမှ ကုဒ်အားလုံးကို Copy ကူးယူပြီး Supabase SQL Editor ထဲသို့ Paste လုပ်ပါ။
4. ညာဘက်အောက်ခြေရှိ စိမ်းရောင် **"Run"** ခလုတ်ကို နှိပ်ပါ။
5. **Success. No rows returned** ဟု ပေါ်လာပါက အောက်ပါ Tables (ဇယား) များနှင့် လုံခြုံရေးစည်းမျဉ်း (RLS Policies) များ အောင်မြင်စွာ တည်ဆောက်ပြီးစီးသွားပါပြီ:
   - `public.profiles` (User Profiles, RBAC Role, Avatar, Bio, Genre)
   - `public.reading_sessions` (Reading Sessions, Invite Codes, Borrow Status)
   - `public.session_members` (Join & Exit Sessions, Progress Tracking)
   - `public.book_cache` (Open Library Metadata Caching)
   - `public.is_admin()` (Developer Admin Authorization Function)

---

## အပိုင်း (၄) - Developer Admin ဝင်ရောက်ခြင်းနှင့် စမ်းသပ်ခြင်း

### Developer Admin Login:
1. Web App ၏ Header (သို့မဟုတ် Hero Banner) မှ **"Developer Admin"** ကို နှိပ်ပါ။
2. စနစ်တွင် သတ်မှတ်ထားသော အောက်ပါ အထူး Admin Credentials ကို ဖြည့်စွက်ပါ:
   - **Admin Mail:** `hudson002619@outlook.com`
   - **Admin Password:** `mYZuMr4W1hjEqE0q`
   (Password ရိုက်ထည့်ချိန်တွင် `***` ဖြင့် ဖုံးကွယ်ထားပြီး **"Show password"** ကို နှိပ်၍ စစ်ဆေးနိုင်ပါသည်။)
3. Admin Login အောင်မြင်ပါက မျက်နှာပြင်တွင် **Developer Admin Exclusive Management Console** ပေါ်လာမည်ဖြစ်ပြီး ဒေတာများကို **Insert, Update, Delete, Select** စိတ်ကြိုက် ပြုလုပ်နိုင်ပါပြီ။

### Regular User & Demo Profiles:
1. သာမန် User အနေဖြင့် စာရင်းသွင်းပါက **Book Club Mail** နှင့် **Open Library Mail** တို့ တူညီမှုရှိရမည်ဖြစ်ပြီး စနစ်မှ အလိုအလျောက် စစ်ဆေးအတည်ပြုပေးပါသည်။
2. Profile မီနူးမှ **Switch Reader Account** ကို နှိပ်ပါက Demo အကောင့်များ (`AD2600`, `Clara_Reads`) သို့သာ ပြောင်းလဲနိုင်ပြီး အခြားသူများ၏ ကိုယ်ပိုင်အကောင့်များကို ဝင်ရောက်စွက်ဖက်ခြင်း မပြုနိုင်စေရန် စနစ်တကျ ကာကွယ်ထားပါသည်။
3. Reading Session များတွင် မတော်တဆ ချိတ်ဆက်မိပါက **"Exit Session"** ခလုတ်ဖြင့် လွယ်ကူစွာ ပြန်လည် ထွက်ခွာနိုင်ပါသည်။

---

## အပိုင်း (၅) - Build & Deployment (အွန်လိုင်းတင်လိုပါက)

Production အတွက် Build ပြုလုပ်လိုပါက:
```bash
npm run build
```
ထွက်လာသော `dist` folder ကို Vercel, Netlify, Cloudflare Pages, Firebase Hosting သို့မဟုတ် မည်သည့် Static Web Server တွင်မဆို လွယ်ကူစွာ Deploy ပြုလုပ်နိုင်ပါသည်။
