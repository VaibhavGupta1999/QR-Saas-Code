# Commercial Hosting Cost & Scaling Economics — Hospitality OS

**Pricing Model:** Flat ₹9,000 / restaurant / year (or ₹8,999 / year)  
**Infrastructure Stack:** Vercel (Edge App Hosting) + Supabase (PostgreSQL, Auth & Realtime) + Cloudflare (DNS)  

---

## 1. Unit Economics & Scaling Matrix

| Scale | Annual Revenue (at ₹9k/client) | Monthly Revenue | Vercel Tier | Supabase Tier | Total Annual Cloud Infra | Net Annual Profit | Net Margin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1 Restaurant (Pilot)** | ₹9,000 | ₹750 | Free (Hobby) | Free / Pro | ₹1,000 – ₹2,500 | **₹6,500 – ₹8,000** | **~75–88%** |
| **10 Restaurants** | ₹90,000 | ₹7,500 | Pro ($20/mo) | Pro ($25/mo) | ~₹45,000 | **₹45,000** | **50%** |
| **25 Restaurants** | ₹2,25,000 | ₹18,750 | Pro ($20/mo) | Pro ($25/mo) | ~₹46,000 | **₹1,79,000** | **79.5%** |
| **50 Restaurants** | ₹4,50,000 | ₹37,500 | Pro ($20/mo) | Pro ($25/mo + compute) | ~₹52,000 | **₹3,98,000** | **88.4%** |
| **100 Restaurants** | ₹9,00,000 | ₹75,000 | Pro ($20/mo) | Pro ($25/mo + compute) | ~₹60,000 | **₹8,40,000** | **93.3%** |

> **Key Takeaway:** Because Next.js serverless and Supabase multi-tenancy are shared across all restaurants, your marginal cloud infrastructure cost per new restaurant is virtually **zero** once base Pro tiers are covered! At 100 restaurants, you pocket over **₹8.4 Lakhs in annual profit**.

---

## 2. Resource Utilization Analysis per Restaurant

Average Indian Cafe Volume:
* Daily orders: ~40 – 60 orders / day
* Daily unique visitors: ~70 – 100 visitors / day
* Monthly page views: ~2,500 page views / month
* Monthly data transfer: ~1.5 GB / month

### 100 Restaurants Combined:
* Monthly page views: ~250,000 page views / month (Vercel Pro includes millions of requests)
* Monthly bandwidth: ~150 GB / month (Vercel Pro includes 1,000 GB / month)
* Supabase Database storage: ~50 MB database size per 10,000 orders (Supabase Pro includes 8 GB database storage, enough for **1.5 million historical orders** before any overage!).

---

## 3. Explicit Free-Tier Limits & Upgrade Triggers

### Vercel
* **Hobby Limit:** 100 GB bandwidth, non-commercial terms.
* **Upgrade Trigger:** Upgrade to **Vercel Pro ($20/month)** as soon as you invoice your first commercial restaurant or exceed 100 GB bandwidth.

### Supabase
* **Free Tier Limit:** 500 MB database, 2 projects, database pauses after 7 days of inactivity.
* **Upgrade Trigger:** Upgrade to **Supabase Pro ($25/month)** upon signing your first paying client to enable 7-day Point-in-Time Recovery (PITR) and prevent database sleeping.

### Hardware Peripherals (Optional Upsell)
* **80mm USB/Bluetooth Thermal Receipt Printer:** ₹2,400 – ₹3,200 on Amazon (Everycom / TVS / Xprinter).
* **A6 Clear Acrylic Table Stands (Pack of 10):** ~₹800 – ₹1,200 (Custom printed with QR code & Wi-Fi details).
* *Upsell opportunity:* Charge ₹13,999/yr for your Premium Plan (including 10 acrylic stands and hardware setup), earning an extra ₹5,000 in immediate margin.
