-- Hospitality OS / QR Menu SaaS — Seed Data for Development & Multi-Tenant Testing
-- Seed File: supabase/seed.sql

-- 1. Insert Tenant 1: Brew Studio India
INSERT INTO restaurants (id, slug, name, tagline, upi_vpa, gstin, fssai, phone, address, currency, tax_rate, subscription_status, subscription_tier)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'brew-studio',
    'Brew Studio India',
    'Specialty Coffee Lab & Bakehouse',
    'brewstudio@okhdfcbank',
    '29AABCU9603R1ZM',
    '11223344556677',
    '+91 98765 43210',
    '100ft Rd, Indiranagar, Bengaluru - 560038',
    'INR',
    5.00,
    'active',
    'pro'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Tenant 2: Blue Tokai Coffee Roasters (for Cross-Tenant Isolation Testing)
INSERT INTO restaurants (id, slug, name, tagline, upi_vpa, gstin, fssai, phone, address, currency, tax_rate, subscription_status, subscription_tier)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'blue-tokai',
    'Blue Tokai Coffee Roasters',
    'Single Origin Specialty Coffees',
    'bluetokai@icici',
    '07AABCU1111R1ZM',
    '22334455667788',
    '+91 98111 22233',
    'Connaught Place, New Delhi - 110001',
    'INR',
    5.00,
    'active',
    'starter'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Tables for Tenant 1 (Brew Studio)
INSERT INTO restaurant_tables (restaurant_id, table_number) VALUES
('a0000000-0000-0000-0000-000000000001', 'Table 01'),
('a0000000-0000-0000-0000-000000000001', 'Table 02'),
('a0000000-0000-0000-0000-000000000001', 'Table 03'),
('a0000000-0000-0000-0000-000000000001', 'Table 04'),
('a0000000-0000-0000-0000-000000000001', 'Table 05')
ON CONFLICT DO NOTHING;

-- 4. Insert Tables for Tenant 2 (Blue Tokai)
INSERT INTO restaurant_tables (restaurant_id, table_number) VALUES
('b0000000-0000-0000-0000-000000000002', 'Table A1'),
('b0000000-0000-0000-0000-000000000002', 'Table A2')
ON CONFLICT DO NOTHING;

-- 5. Insert Categories for Tenant 1
INSERT INTO categories (id, restaurant_id, slug, name, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'signatures', 'Signature Brews', 1),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'espresso', 'Espresso Lab', 2),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'bakehouse', 'Artisanal Bakehouse', 3)
ON CONFLICT DO NOTHING;

-- 6. Insert Menu Items for Tenant 1
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, station, is_veg, is_available, is_featured, allows_customization, badge) VALUES
('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Whiskey Barrel Cold Brew', 'Aged 48h in char oak barrels with notes of vanilla & dried figs.', 320.00, 'barista', TRUE, TRUE, TRUE, TRUE, 'Bestseller'),
('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Spanish Saffron Latte', 'Double espresso, sweetened condensed oat milk, Iranian saffron strand.', 290.00, 'barista', TRUE, TRUE, TRUE, TRUE, 'Trending on IG'),
('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Almond Frangipane Croissant', 'Twice-baked French butter croissant filled with velvety almond cream.', 240.00, 'kitchen', TRUE, TRUE, FALSE, FALSE, 'Chef Special')
ON CONFLICT DO NOTHING;

-- 7. Insert Menu Items for Tenant 2 (Blue Tokai)
INSERT INTO menu_items (id, restaurant_id, name, description, price, station, is_veg, is_available) VALUES
('m0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'Attikan Estate Pour Over', 'Washed arabica with sweet dark chocolate notes.', 260.00, 'barista', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- 8. Insert Staff Accounts with Salted Hash PINs (Demo PIN for Tenant 1: "1234", Tenant 2: "9999")
-- PIN "1234" with salt "salt123": SHA256("1234salt123") = "036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc"
INSERT INTO staff (id, restaurant_id, name, email, role, pin_hash, pin_salt) VALUES
('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Vikram Malhotra (Owner)', 'owner@brewstudio.in', 'owner', '036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc', 'salt123'),
('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Suresh (Head Barista / KDS)', 'chef@brewstudio.in', 'chef', '036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc', 'salt123'),
('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Priya (Cashier)', 'cashier@brewstudio.in', 'cashier', '036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc', 'salt123')
ON CONFLICT DO NOTHING;

-- 9. Insert Developer / Platform Operator Super-Admin
-- Email: Vaibhavgupta1148@gmail.com
-- Raw password "Vg@25121999" is stored exclusively as a cryptographically salted scrypt hash
-- Terminal PIN: "2512" (SHA256 salted hash)
INSERT INTO staff (id, restaurant_id, name, email, role, pin_hash, pin_salt, password_hash, password_salt) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Vaibhav Gupta (Lead Developer & Platform Operator)',
  'Vaibhavgupta1148@gmail.com',
  'platform_operator',
  '8542c77046e7d830f3d8e00ddc0b080de4917bc314e4780d0988056e57aab292',
  'salt2512',
  '4591e0f4ec756d2f54638627eaa2749de6e8d39630e1ea4cc63d49dae2bc96aeb0ad50a61f2519bbfe688e05f2e5e2bff6cce69534cf35a18da0e324cf88f1ca',
  '5cd17468126c5dca4d66954826f73274'
)
ON CONFLICT DO NOTHING;
