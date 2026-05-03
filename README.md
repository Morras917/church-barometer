# ⛪ Church Fundraising Barometer

A live, real-time fundraising thermometer for your church — built with Next.js, Supabase, and deployed on Vercel.

---

## 🚀 Quick Setup (30 minutes)

### Step 1 — Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a **New Project** (choose a region near South Africa, e.g. `eu-central-1`)
3. Open **SQL Editor** and paste the entire contents of `supabase-setup.sql` — click **Run**
4. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon public** key

### Step 2 — GitHub

1. Create a new repository on GitHub (e.g. `church-barometer`)
2. Push this project:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/church-barometer.git
git push -u origin main
```

### Step 3 — Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** → Import your `church-barometer` repo
3. Under **Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `ADMIN_SECRET` | A strong password you choose (e.g. `Seafront2024!`) |

4. Click **Deploy** — done! ✅

---

## 💡 Updating the Amount

Visit `https://your-site.vercel.app/admin` to update the total. Enter the new amount and your admin password.

The barometer updates **in real time** on all open screens — no refresh needed.

---

## ⚙️ Customising

Edit the initial row in Supabase (`Table Editor → fundraising`) to change:
- `title` — e.g. "New Roof Fund"
- `goal` — e.g. `500000` for R500,000
- `currency` — e.g. `R` for Rand

---

## 🛠 Local Development

```bash
cp .env.example .env.local
# Fill in your Supabase values

npm install
npm run dev
# Open http://localhost:3000
```
