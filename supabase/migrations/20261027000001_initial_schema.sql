-- Hospitality OS / QR Menu SaaS — Initial Production PostgreSQL Schema
-- Migration: 20261027000001_initial_schema.sql
-- Supports Multi-tenant SaaS with RLS, Constraints, Audit History & Idempotency

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. RESTAURANTS (TENANTS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    tagline VARCHAR(256),
    upi_vpa VARCHAR(128) NOT NULL, -- e.g. "brewstudio@okhdfcbank"
    gstin VARCHAR(32),              -- e.g. "29AABCU9603R1ZM"
    fssai VARCHAR(32),              -- e.g. "11223344556677"
    phone VARCHAR(32) NOT NULL,
    address TEXT NOT NULL,
    currency VARCHAR(8) DEFAULT 'INR',
    tax_rate NUMERIC(5,2) DEFAULT 5.00, -- 5.00% Indian Restaurant GST default
    subscription_status VARCHAR(32) DEFAULT 'active' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'expired')),
    subscription_tier VARCHAR(32) DEFAULT 'pro' CHECK (subscription_tier IN ('starter', 'pro', 'premium')),
    subscription_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_active_status ON restaurants(is_active, subscription_status);

-- ============================================================================
-- 2. STAFF & RBAC (INDIVIDUAL IDENTITIES & HASHED PINS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('platform_operator', 'owner', 'manager', 'chef', 'cashier')),
    pin_hash VARCHAR(128) NOT NULL,
    pin_salt VARCHAR(64) NOT NULL,
    password_hash VARCHAR(256),
    password_salt VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_restaurant ON staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- ============================================================================
-- 3. RESTAURANT TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(32) NOT NULL,
    qr_token VARCHAR(64) NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON restaurant_tables(restaurant_id);

-- ============================================================================
-- 4. MENU CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    slug VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id, sort_order);

-- ============================================================================
-- 5. MENU ITEMS & INGREDIENT 86 STATUS
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10,2),
    image TEXT,
    station VARCHAR(32) NOT NULL DEFAULT 'barista' CHECK (station IN ('barista', 'kitchen')),
    is_veg BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    allows_customization BOOLEAN DEFAULT FALSE,
    badge VARCHAR(64),
    tasting_notes TEXT[] DEFAULT '{}',
    calories INT DEFAULT 0,
    caffeine_intensity INT DEFAULT 3,
    roast_level VARCHAR(32),
    moods TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);

-- ============================================================================
-- 6. ITEM MODIFIERS (BEANS, MILKS, SWEETNESS, BOOSTERS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('bean', 'milk', 'sweetness', 'booster')),
    name VARCHAR(128) NOT NULL,
    extra_price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (extra_price >= 0),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, type, name)
);

CREATE INDEX IF NOT EXISTS idx_modifiers_restaurant ON item_modifiers(restaurant_id, type);

-- ============================================================================
-- 7. ORDERS & COLLISION-SAFE DAILY TOKEN SEQUENCE
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS order_daily_sequence START 1;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_token VARCHAR(64) NOT NULL,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    table_number VARCHAR(64) NOT NULL,
    customer_name VARCHAR(128) NOT NULL DEFAULT 'Valued Guest',
    customer_phone VARCHAR(32),
    order_type VARCHAR(32) NOT NULL DEFAULT 'DINE_IN' CHECK (order_type IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY')),
    delivery_address TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'brewing', 'ready', 'completed', 'cancelled')),
    payment_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_mode VARCHAR(32) NOT NULL DEFAULT 'instant_upi' CHECK (payment_mode IN ('instant_upi', 'upi_counter', 'cash', 'card')),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10,2) NOT NULL CHECK (tax >= 0),
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    idempotency_key VARCHAR(128),
    prep_started_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, order_token),
    UNIQUE (restaurant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(restaurant_id, created_at DESC);

-- ============================================================================
-- 8. ORDER ITEMS (HISTORICAL IMMUTABLE SNAPSHOT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(128) NOT NULL,
    station VARCHAR(32) NOT NULL CHECK (station IN ('barista', 'kitchen')),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    customization JSONB DEFAULT '{}'::jsonb,
    completed_in_kitchen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_station ON order_items(station, completed_in_kitchen);

-- ============================================================================
-- 9. PAYMENTS (LEDGER SEPARATE FROM ORDERS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_mode VARCHAR(32) NOT NULL,
    transaction_reference VARCHAR(128),
    verified_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'verified' CHECK (status IN ('initiated', 'verified', 'rejected', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_restaurant ON payments(restaurant_id, created_at DESC);

-- ============================================================================
-- 10. AUDIT LOGS (IMMUTABLE OPERATIONAL TRAIL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    actor_type VARCHAR(32) NOT NULL CHECK (actor_type IN ('customer', 'staff', 'system')),
    actor_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_restaurant ON audit_logs(restaurant_id, created_at DESC);
