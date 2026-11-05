-- Hospitality OS / QR Menu SaaS — Row Level Security (RLS) & Multi-Tenant Isolation
-- Migration: 20261027000002_rls_policies.sql

-- Enable RLS on all operational tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for tenant and role extraction
CREATE OR REPLACE FUNCTION current_app_tenant() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_platform_operator() RETURNS BOOLEAN AS $$
  SELECT COALESCE(current_setting('app.staff_role', true) = 'platform_operator', false);
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_staff_role() RETURNS TEXT AS $$
  SELECT COALESCE(current_setting('app.staff_role', true), 'anonymous');
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 1. RESTAURANTS POLICIES
-- ============================================================================
-- Public can view active restaurants (for menu loading)
CREATE POLICY restaurants_public_read ON restaurants
    FOR SELECT
    USING (is_active = TRUE AND subscription_status != 'suspended');

-- Platform operator has full access
CREATE POLICY restaurants_operator_all ON restaurants
    FOR ALL
    USING (is_platform_operator())
    WITH CHECK (is_platform_operator());

-- Owners can update their own restaurant details
CREATE POLICY restaurants_owner_update ON restaurants
    FOR UPDATE
    USING (id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'))
    WITH CHECK (id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'));

-- ============================================================================
-- 2. STAFF POLICIES (NO ANONYMOUS ACCESS)
-- ============================================================================
CREATE POLICY staff_tenant_isolation ON staff
    FOR ALL
    USING (
        is_platform_operator() OR 
        (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'))
    )
    WITH CHECK (
        is_platform_operator() OR 
        (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'))
    );

-- ============================================================================
-- 3. TABLES POLICIES
-- ============================================================================
CREATE POLICY tables_public_read ON restaurant_tables
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY tables_staff_manage ON restaurant_tables
    FOR ALL
    USING (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'))
    WITH CHECK (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'));

-- ============================================================================
-- 4. CATEGORIES POLICIES
-- ============================================================================
CREATE POLICY categories_public_read ON categories
    FOR SELECT
    USING (TRUE);

CREATE POLICY categories_staff_manage ON categories
    FOR ALL
    USING (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'))
    WITH CHECK (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'));

-- ============================================================================
-- 5. MENU ITEMS & 86 TOGGLE
-- ============================================================================
CREATE POLICY menu_items_public_read ON menu_items
    FOR SELECT
    USING (TRUE);

CREATE POLICY menu_items_staff_manage ON menu_items
    FOR ALL
    USING (
        restaurant_id = current_app_tenant() AND 
        current_staff_role() IN ('owner', 'manager', 'chef')
    )
    WITH CHECK (
        restaurant_id = current_app_tenant() AND 
        current_staff_role() IN ('owner', 'manager', 'chef')
    );

-- ============================================================================
-- 6. ITEM MODIFIERS
-- ============================================================================
CREATE POLICY modifiers_public_read ON item_modifiers
    FOR SELECT
    USING (is_available = TRUE);

CREATE POLICY modifiers_staff_manage ON item_modifiers
    FOR ALL
    USING (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager', 'chef'))
    WITH CHECK (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager', 'chef'));

-- ============================================================================
-- 7. ORDERS & ISOLATION
-- ============================================================================
-- Staff can view all orders for their tenant
CREATE POLICY orders_staff_select ON orders
    FOR SELECT
    USING (
        is_platform_operator() OR 
        (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager', 'chef', 'cashier'))
    );

-- Kitchen/Chef can update status (brewing, ready, completed)
CREATE POLICY orders_staff_update ON orders
    FOR UPDATE
    USING (
        restaurant_id = current_app_tenant() AND 
        current_staff_role() IN ('owner', 'manager', 'chef', 'cashier')
    )
    WITH CHECK (
        restaurant_id = current_app_tenant() AND 
        current_staff_role() IN ('owner', 'manager', 'chef', 'cashier')
    );

-- ============================================================================
-- 8. ORDER ITEMS
-- ============================================================================
CREATE POLICY order_items_staff_access ON order_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
              AND (orders.restaurant_id = current_app_tenant() OR is_platform_operator())
        )
    );

-- ============================================================================
-- 9. PAYMENTS (LEDGER - CASHIER/MANAGER ONLY)
-- ============================================================================
CREATE POLICY payments_staff_access ON payments
    FOR ALL
    USING (
        is_platform_operator() OR 
        (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager', 'cashier'))
    )
    WITH CHECK (
        is_platform_operator() OR 
        (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager', 'cashier'))
    );

-- ============================================================================
-- 10. AUDIT LOGS (APPEND-ONLY)
-- ============================================================================
CREATE POLICY audit_logs_read ON audit_logs
    FOR SELECT
    USING (
        is_platform_operator() OR 
        (restaurant_id = current_app_tenant() AND current_staff_role() IN ('owner', 'manager'))
    );

CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (TRUE);
