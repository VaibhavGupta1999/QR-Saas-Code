# Row Level Security (RLS) Policy Inventory & Role Permissions Matrix

**System:** Hospitality OS / QR Menu SaaS  
**Backend:** Supabase PostgreSQL 15+  
**Status:** ENFORCED  

---

## 1. Role-Permissions Matrix (RBAC)

| Role | Scope | Key Capabilities | Prohibited Operations |
| :--- | :--- | :--- | :--- |
| **`platform_operator`** | Global | Full tenant provisioning, subscription suspension/reactivation, audit inspection. | Cannot alter customer order items directly without audit log. |
| **`owner`** | Tenant | Manage staff, menu pricing, table QR codes, view executive revenue KPIs, verify payments. | Cannot access data from other restaurant tenants. |
| **`manager`** | Tenant | Update menu availability (86), view live orders, verify payments, print receipts. | Cannot delete restaurant account or change proprietor bank UPI VPA. |
| **`chef` / `barista`** | Tenant (KDS) | View station queue, advance order status (`new` ➔ `brewing` ➔ `ready`), toggle 86 item sold-out. | **CANNOT** view total revenues, alter item prices, or verify payments. |
| **`cashier`** | Tenant | Reconcile UPI payments, record transaction reference/UTR, print official Rule 46 tax invoices. | **CANNOT** edit menu prices, change kitchen prep status, or view other tenants. |
| **`anonymous_guest`**| Table / Session| Browse active menu, place validated order via server action, view live progress of active token. | **CANNOT** access `/admin`, `/kds`, `/chef`, or query other tables. |

---

## 2. Table-by-Table RLS Policy Catalog

All tables have `ROW LEVEL SECURITY` explicitly enabled.

### Table: `restaurants`
* **`restaurants_public_read`** (SELECT):
  * Target: `anon`, `authenticated`
  * Using: `is_active = TRUE AND subscription_status != 'suspended'`
  * Purpose: Allows customer phones to load cafe branding, GSTIN, and UPI handle.
* **`restaurants_operator_all`** (ALL):
  * Target: `authenticated` (role = `platform_operator`)
  * Using: `is_platform_operator()`
* **`restaurants_owner_update`** (UPDATE):
  * Target: `authenticated` (role IN `owner`, `manager`)
  * Using: `id = current_app_tenant()`

### Table: `staff`
* **`staff_tenant_isolation`** (ALL):
  * Target: `authenticated`
  * Using: `is_platform_operator() OR (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'))`
  * **Anonymous Access:** Strictly DENIED.

### Table: `restaurant_tables`
* **`tables_public_read`** (SELECT):
  * Target: `anon`, `authenticated`
  * Using: `is_active = TRUE`
* **`tables_staff_manage`** (ALL):
  * Target: `authenticated` (roles: `owner`, `manager`)
  * Using: `restaurant_id = current_app_tenant()`

### Table: `menu_items` & `item_modifiers`
* **`menu_items_public_read`** (SELECT):
  * Target: `anon`, `authenticated`
  * Using: `TRUE` (Public customer catalog)
* **`menu_items_staff_manage`** (ALL):
  * Target: `authenticated` (roles: `owner`, `manager`, `chef`)
  * Using: `restaurant_id = current_app_tenant()`
  * Purpose: Allows kitchen staff to toggle `is_available` (86 button) and owners to edit items.

### Table: `orders` & `order_items`
* **`orders_staff_select`** (SELECT):
  * Target: `authenticated` (roles: `owner`, `manager`, `chef`, `cashier`, `platform_operator`)
  * Using: `restaurant_id = current_app_tenant() OR is_platform_operator()`
* **`orders_staff_update`** (UPDATE):
  * Target: `authenticated` (roles: `owner`, `manager`, `chef`, `cashier`)
  * Using: `restaurant_id = current_app_tenant()`
  * Enforces state machine transition rules.
* **Direct Anonymous Insert:** Disallowed directly via client SDK; customer order placement routes through validated server action `/api/orders/create`.

### Table: `payments` (Ledger)
* **`payments_staff_access`** (ALL):
  * Target: `authenticated` (roles: `owner`, `manager`, `cashier`, `platform_operator`)
  * Using: `restaurant_id = current_app_tenant() OR is_platform_operator()`
  * **Anonymous Access:** Strictly DENIED. Prevents customer manipulation of financial ledgers.

### Table: `audit_logs`
* **`audit_logs_read`** (SELECT):
  * Target: `authenticated` (roles: `owner`, `platform_operator`)
  * Using: `restaurant_id = current_app_tenant() OR is_platform_operator()`
* **`audit_logs_insert`** (INSERT):
  * Target: `system`, `authenticated`
  * Purpose: Append-only compliance trail.
