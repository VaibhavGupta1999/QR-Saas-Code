# QR-Saas-Code

**Brew Studio India — Specialty Coffee Lab & Hospitality Operating System (QR Menu, Barista KDS & Roastery Admin SaaS)**

## Live Client Demo Routes

| Module | Route | Demo Credentials / Notes |
| :--- | :--- | :--- |
| **Customer QR Digital Menu** | `/menu?table=04` | Auto-binds table from QR parameter (`?table=01` to `?table=10`) |
| **Two-Column Barista KDS** | `/kitchen?unlock=true` | Staff PIN: `1234` (or use `?unlock=true` for 1-click demo unlock) |
| **Roastery Admin & QR Studio** | `/admin?unlock=true` | Staff PIN: `1234` · Includes Table QR Standee Generator & 80mm GST Billing |
| **SaaS Multi-Tenant Console** | `/operator` | Operator email: `dev@brewstudio.in` / Password: `BrewMaster@2026#Secure!` |

## Deploying on Vercel Hobby

1. Import `https://github.com/VaibhavGupta1999/QR-Saas-Code.git` in [Vercel](https://vercel.com/new).
2. Framework Preset: **Next.js** (auto-detected).
3. Click **Deploy** — zero external environment variables are required for the full interactive client demo.
4. Once deployed on your `.vercel.app` URL:
   - Click **Table QR** in the top navigation bar (or open `/admin?tab=qr&unlock=true`).
   - The QR Studio automatically detects your live `.vercel.app` domain and encodes scannable table URLs (`https://<your-domain>.vercel.app/menu?table=04`).
   - Orders placed from a mobile phone scanning the QR code sync live to the Barista KDS (`/kitchen?unlock=true`) and Admin console (`/admin?unlock=true`).
