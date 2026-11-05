# Staging & Production Deployment Guide — Hospitality OS / QR Menu SaaS

This guide provides reproducible instructions for deploying Hospitality OS to production on **Vercel** backed by **Supabase PostgreSQL**.

---

## 1. Prerequisites

1. **Vercel Account:** Pro plan recommended for commercial SLA and team access ($20/mo).
2. **Supabase Account:** Standard project created in the region closest to your customers (e.g., `ap-south-1` Mumbai for India).
3. **Custom Domain:** e.g., `brewstudio.in` or `hospitalityos.in` managed on Cloudflare or Namecheap.

---

## 2. Database Provisioning (Supabase PostgreSQL)

### Step 2.1: Run Version-Controlled Migrations
In your Supabase project dashboard ➔ **SQL Editor**, execute the migration scripts in sequential order:

1. `supabase/migrations/20261027000001_initial_schema.sql` (Tables, constraints, sequences, indices)
2. `supabase/migrations/20261027000002_rls_policies.sql` (Row-Level Security & isolation policies)
3. *(Optional for Dev/Staging)* `supabase/seed.sql` (Seed data for Brew Studio and Blue Tokai test accounts)

### Step 2.2: Enable Supabase Realtime
In Supabase Dashboard ➔ **Database** ➔ **Replication**:
* Enable replication on tables: `orders`, `order_items`, and `menu_items`.
* This powers the real-time kitchen tablet chimes and live customer order tracker.

---

## 3. Environment Variables Configuration (Vercel)

In your Vercel Project Settings ➔ **Environment Variables**, add the following keys for both **Production** and **Preview** environments:

| Variable Name | Environment | Example / Value | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Prod / Preview | `https://menu.yourdomain.com` | Base public URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Prod / Preview | `https://xyzcompany.supabase.co` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Prod / Preview | `eyJhbGciOi...` | Supabase Public Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Production Only** | `eyJhbGciOi...` | Privileged Backend Key (Never client exposed) |
| `STAFF_SESSION_SECRET` | Prod / Preview | `[64-char-random-hex-string]` | Secret for signing staff PIN session tokens |
| `NODE_ENV` | Production | `production` | Node environment |

> **SECURITY RULE:** Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`. It must remain strictly server-side.

---

## 4. Vercel Build & Deployment Settings

* **Framework Preset:** Next.js
* **Build Command:** `next build`
* **Output Directory:** `.next`
* **Install Command:** `npm install`
* **Node.js Version:** `20.x` or `22.x`

### Verification Command
Run locally before pushing to git:
```bash
npm test && npm run build
```

---

## 5. Domain & DNS Routing

In your DNS provider (e.g., Cloudflare):
1. **CNAME Record:** `menu` ➔ `cname.vercel-dns.com`
2. **SSL / TLS Encryption:** Full / Strict (Vercel automatically provisions and renews Let's Encrypt certificates).

---

## 6. Pre-Launch Sanity Checklist

1. [ ] Health Check returns `200 OK`: `curl https://yourdomain.com/api/health`
2. [ ] Automated test suite executed and 100% passing (`npm test`).
3. [ ] Customer table order placement works and returns collision-safe order token (`BS-YYYYMMDD-001`).
4. [ ] Staff PIN login functions on tablet (`/chef`, `/kitchen`, `/kds`).
5. [ ] 80mm ESC/POS Thermal Print renders accurately for both KOT and Rule 46 Tax Invoice.
6. [ ] Operator Console (`/operator`) loads and shows active tenants.
