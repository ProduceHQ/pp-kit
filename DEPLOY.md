# Deploying PP Kit

This document walks you through the one-time setup to get the app live for your team.

---

## Overview

| Layer | Service |
|---|---|
| Database | [Supabase](https://supabase.com) (free tier) |
| Frontend | [Vercel](https://vercel.com) (free tier) |
| Access | Shared passcode (set by you) |

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project**, give it a name (e.g. `pp-kit`), set a database password, choose a region close to you
3. Once the project is ready, go to the **SQL Editor** tab
4. Paste and run this SQL to create the tables:

```sql
create table inventory (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  qty integer not null default 1,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number text not null default '',
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now()
);

create table project_kit (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  item_id uuid not null references inventory(id) on delete cascade,
  qty integer not null default 1
);

alter table inventory enable row level security;
alter table projects enable row level security;
alter table project_kit enable row level security;

create policy "anon_all" on inventory for all to anon using (true) with check (true);
create policy "anon_all" on projects for all to anon using (true) with check (true);
create policy "anon_all" on project_kit for all to anon using (true) with check (true);
```

5. Go to **Settings → API** and note down:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long JWT string under "Project API keys")
   - **service_role** key (keep this secret — only used for seeding)

---

## Step 2 — Seed the inventory

This populates your Supabase database with the 74 default kit items.

1. In the project root, create a file called `.env.local` (it is git-ignored):

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_ACCESS_CODE=choose-a-team-passcode
```

2. Run the seed script once:

```bash
node scripts/seed.js
```

You should see: `✓ Seeded 74 items successfully.`

You can verify by checking the `inventory` table in Supabase's **Table Editor**.

---

## Step 3 — Test locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the passcode screen, then the full app pulling data from Supabase.

---

## Step 4 — Push to GitHub

1. Create a new **private** repository on [github.com](https://github.com)
2. In the project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/pp-kit.git
git push -u origin main
```

> ⚠️ Make sure `.env.local` is listed in `.gitignore` (it is by default with Vite) — never commit your keys.

---

## Step 5 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in with your GitHub account
2. Click **Add New → Project** and import your `pp-kit` repository
3. Under **Environment Variables**, add these three:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `VITE_ACCESS_CODE` | Your chosen team passcode |

4. Click **Deploy**

Vercel will build and publish the app. You'll get a URL like `pp-kit.vercel.app` — share this with your team along with the passcode.

---

## Step 6 — Share with your team

Send your team:
- The Vercel URL
- The access passcode

---

## Ongoing updates

Any time you push a new commit to `main` on GitHub, Vercel will automatically rebuild and redeploy. No manual steps needed.

---

## Custom domain (optional)

In your Vercel project settings → **Domains**, you can add a custom domain (e.g. `kit.perspectivepictures.com`) if you have one.
