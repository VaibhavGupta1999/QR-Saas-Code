# Forensic Codebase Audit Report — Hospitality OS / QR Menu SaaS

**Audit Date:** October 27, 2026  
**Auditor:** Principal Software Engineer  
**System Evaluated:** Hospitality OS / QR Menu SaaS (Next.js 16.4.3, React 19.3.0, TypeScript 5, Tailwind CSS 4)  
**Target Deployment:** Multi-tenant Restaurant SaaS on Vercel + Supabase PostgreSQL  

---

## Executive Summary

A comprehensive forensic audit of the repository was conducted. While the application possesses a visually rich, responsive user interface with comprehensive client workflows (Customer Menu, Barista Customizer, Live Tracker, Chef KDS, Admin Command Center, 80mm Receipt Generator), **the current codebase operated entirely as a client-side prototype** using browser `localStorage` and `BroadcastChannel`. 

Critical architectural vulnerabilities—including client-side price calculation, unauthenticated admin routes, single-tab broadcast isolation, non-collision-safe order IDs, and absence of database persistence—must be resolved before serving paying restaurants.

---

## Prioritized Vulnerability & Risk Inventory

| ID | Category | Severity | Title | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Security / Auth | **CRITICAL** | Zero Authentication / Authorization on Admin & Kitchen Routes | Open |
| **SEC-02** | Security / Financial | **CRITICAL** | Client-Side Price & Payment Status Authority (Price Tampering) | Open |
| **DAT-01** | Data Integrity | **CRITICAL** | Volatile Client-Only State (`localStorage` & `BroadcastChannel`) | Open |
| **DAT-02** | Data Integrity | **HIGH** | High-Collision Token Generation (`Math.random()` 100–900) | Open |
| **TEN-01** | Multi-Tenancy | **CRITICAL** | Hardcoded Single-Tenant Identity (No Tenant Context or Isolation) | Open |
| **REL-01** | Reliability | **HIGH** | Incomplete Route `/kds` (Empty Directory) & Unreliable Realtime | Open |
| **REL-02** | Financial | **MEDIUM** | Unvalidated Tax Calculations & Missing KOT vs Invoice Separation | Open |
| **OPS-01** | Operations | **HIGH** | Zero Automated Tests, No CI/CD Pipeline, No Health Endpoint | Open |

---

## Detailed Findings & Action Plan

### SEC-01: Zero Authentication or Authorization on Admin & Kitchen Routes
* **Severity:** **CRITICAL**
* **Affected Files:** `src/app/admin/page.tsx`, `src/app/chef/page.tsx`, `src/app/kitchen/page.tsx`, `src/app/receipt/page.tsx`
* **Evidence:** Any user visiting `/admin` can alter menu item prices, toggle out-of-stock items, inspect live customer names and phone numbers, or trigger `resetToDemoDefaults()` to wipe records. No session, password, or PIN verification exists.
* **Impact:** Malicious customers scanning table QR codes can navigate to `/admin` and manipulate the entire restaurant's menu or view other customers' PII.
* **Remediation:** 
  1. Implement server-side route protection and role-based access control (RBAC).
  2. Implement staff PIN authentication with salt/hash and rate limiting for quick tablet switching.
  3. Enforce Supabase Row-Level Security (RLS) on all underlying database operations.
* **Verification:** Automated tests attempting unauthenticated GET and POST requests to `/admin` and management endpoints to verify `401 Unauthorized` / `403 Forbidden` responses.

---

### SEC-02: Client-Side Price & Payment Status Authority (Financial Tampering)
* **Severity:** **CRITICAL**
* **Affected Files:** `src/context/BrewStudioContext.tsx` (lines 446–472), `src/components/Customer/CartDrawer.tsx` (lines 83–86)
* **Evidence:**
  ```typescript
  // BrewStudioContext.tsx:
  const subtotal = cartSubtotal; // Computed from client cart state!
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  ...
  paymentStatus: paymentMode === 'instant_upi' ? 'paid' : 'pending',
  ```
  The client calculates the subtotal, tax, and grand total. If the customer selects `instant_upi`, the order status is automatically stamped as `'paid'` in local state before any real bank transaction or cashier reconciliation occurs!
* **Impact:** Any user opening DevTools can alter item prices to ₹1, or submit a request that automatically records an order as `'paid'`.
* **Remediation:**
  1. Move all price calculations, modifier additions, tax calculations, and discount logic to a validated server API (`/api/orders/create`).
  2. The server must independently fetch current item prices and modifier costs from PostgreSQL.
  3. Mark all new orders as `payment_status = 'pending'`. Payment status may only be transitioned to `'paid'` via an authorized Cashier verification endpoint or verified webhook.
* **Verification:** Negative test submitting modified client payloads (e.g. ₹500 item sent with `unitPrice: 1`), verifying the server rejects or recalculates the true price.

---

### DAT-01: Volatile Client-Only State (`localStorage` & `BroadcastChannel`)
* **Severity:** **CRITICAL**
* **Affected Files:** `src/context/BrewStudioContext.tsx` (lines 79–125)
* **Evidence:**
  ```typescript
  const STORAGE_KEY_MENU = 'brew_studio_menu_v1';
  const STORAGE_KEY_ORDERS = 'brew_studio_orders_v1';
  const BROADCAST_CHANNEL_NAME = 'brew_studio_realtime_channel';
  ```
  Orders placed on a customer's smartphone are saved to that smartphone's browser storage. They are broadcast over `BroadcastChannel`, which **only reaches other tabs on that exact same smartphone**. A chef on a tablet or a manager on a PC never receives the order.
* **Impact:** The application cannot function in a physical restaurant setting without cross-device database synchronization.
* **Remediation:**
  1. Provision PostgreSQL schema (tenants, tables, menu, orders, line items, payments).
  2. Implement Supabase Realtime channel subscriptions (`restaurant:{id}:orders`).
  3. Implement polling fallback with reconnection recovery for kitchens with spotty Wi-Fi.
* **Verification:** Cross-device test: submitting an order via server API and verifying it is received by a separate client subscriber.

---

### DAT-02: High-Collision Token Generation (`Math.random()` 100–900)
* **Severity:** **HIGH**
* **Affected Files:** `src/context/BrewStudioContext.tsx` (lines 430–431)
* **Evidence:**
  ```typescript
  const tokenNum = Math.floor(100 + Math.random() * 900);
  const orderId = `BS-${tokenNum}`;
  ```
  There are only 800 possible token numbers. Under the Birthday Paradox, an order collision occurs within ~30 orders on a busy Saturday.
* **Impact:** Customers and kitchen staff will receive duplicate order numbers, causing kitchen confusion, wrong food delivery, and corrupted audit logs.
* **Remediation:**
  1. Use UUIDs as internal immutable primary keys.
  2. Generate collision-safe, restaurant-scoped sequential daily tokens: `{RESTAURANT_PREFIX}-{YYYYMMDD}-{SEQUENCE_NUM}` (e.g., `BS-20261027-001`).
* **Verification:** Automated concurrency test creating 100 concurrent orders and verifying zero duplicate token numbers.

---

### TEN-01: Hardcoded Single-Tenant Identity (No Multi-Tenant Isolation)
* **Severity:** **CRITICAL**
* **Affected Files:** `src/context/BrewStudioContext.tsx`, `src/data/initialMenu.ts`, `src/app/receipt/page.tsx`
* **Evidence:** Restaurant name ("Brew Studio India"), address, GSTIN (`29AABCU9603R1ZM`), FSSAI, UPI handle, and menu items are hardcoded in application source files.
* **Impact:** Cannot onboard a second paying restaurant without duplicating the entire codebase. No tenant boundaries or database isolation.
* **Remediation:**
  1. Add `restaurants` table with `slug`, `upi_vpa`, `gstin`, `fssai`, `subscription_status`, and `subscription_expires_at`.
  2. Implement tenant resolution via URL slug / subdomain (`/r/[slug]/menu` or request header).
  3. Enforce PostgreSQL Row-Level Security (RLS) on `restaurant_id`.
* **Verification:** Automated cross-tenant tests ensuring Restaurant A cannot read or mutate Restaurant B's orders or menus.

---

### REL-01: Incomplete Route `/kds` and Unreliable Realtime
* **Severity:** **HIGH**
* **Affected Files:** `src/app/kds/` (empty directory), `src/app/chef/page.tsx`
* **Evidence:** The `/kds` directory is completely empty; only `/chef` and `/kitchen` exist, but navigation and documentation refer to `/kds`. Furthermore, the kitchen view relies on browser memory with no offline queue or missed-event recovery.
* **Impact:** Links to `/kds` return 404. Kitchen tablets that temporarily drop connection lose all order alerts.
* **Remediation:**
  1. Provide proper `/kds/page.tsx` with station filtering and offline recovery.
  2. Implement missed-event synchronization (sync orders since last acknowledged timestamp on reconnection).
* **Verification:** Verify `/kds` loads correctly, and test reconnection recovery after simulated network disconnect.

---

### REL-02: Missing KOT vs Customer Bill Separation
* **Severity:** **MEDIUM**
* **Affected Files:** `src/app/receipt/page.tsx`
* **Evidence:** The receipt page only prints a combined tax slip. In Indian commercial kitchens, the kitchen requires a **KOT (Kitchen Order Ticket)** without prices, showing only Table, Items, Modifiers, and Notes, while the cashier requires a **Tax Invoice** with CGST/SGST breakdowns and FSSAI.
* **Impact:** Inefficient kitchen operations and non-compliance with commercial restaurant printing workflows.
* **Remediation:**
  1. Separate printable formats into KOT, Customer Bill, and Official Tax Invoice.
  2. Format strictly for standard 80mm thermal printers with `@media print` optimizations.
* **Verification:** Verify distinct output for KOT vs Tax Invoice with exact 5% GST calculations (2.5% CGST + 2.5% SGST).

---

### OPS-01: Zero Automated Tests & Missing Health Endpoint
* **Severity:** **HIGH**
* **Affected Files:** `package.json`, root directory
* **Evidence:** `package.json` contains no test runner script. No automated test files exist in the repository. No health check endpoint exists to monitor service availability on Vercel/Supabase.
* **Impact:** Regressions cannot be detected automatically; cannot prove production readiness or compliance with acceptance gates.
* **Remediation:**
  1. Implement automated test suite covering multi-tenant isolation, price tampering, duplicate orders, state transitions, and RBAC using Node's native test runner.
  2. Add `/api/health` endpoint for monitoring database and service health.
  3. Add `npm test` script to `package.json`.
* **Verification:** Run test suite and verify 100% passing tests.

---

## Preserved Core Features
The following functioning UI/UX assets will be preserved and integrated into the production architecture:
1. **Artisanal Theme & Design System**: Dark roast color palette (`#1A1412`, `#C97943`, `#F8F4ED`), custom typography, and responsive micro-animations.
2. **Customer Menu UI**: Brand Hero, Mood Compass filter, Menu Cards, and Barista Customizer modal.
3. **Sound Engine**: Web Audio API synthetic chimes (`playCafeOrderChime`, `playOrderReadyChime`).
4. **Thermal Receipt Layout**: Clean 80mm printable layout.
5. **Universal QR Studio**: Vector table QR code generator with Wi-Fi credential embedding.
