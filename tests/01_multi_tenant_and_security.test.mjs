import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPin,
  verifyPin,
  hashPassword,
  verifyPassword,
  createStaffToken,
  verifyStaffToken,
  hasPermission,
  DEVELOPER_OPERATOR,
} from '../src/lib/security/rbac.ts';
import { verifyOrderPayment } from '../src/lib/orders/paymentService.ts';
import { transitionOrderStatus } from '../src/lib/orders/statusService.ts';
import { OrderRepository } from '../src/lib/orders/orderService.ts';

test('RBAC: Permissions matrix enforces least privilege', () => {
  assert.equal(hasPermission('chef', 'orders:update_kitchen_status'), true);
  assert.equal(hasPermission('chef', 'payments:verify'), false, 'Chef must not be allowed to verify payments');
  assert.equal(hasPermission('cashier', 'payments:verify'), true);
  assert.equal(hasPermission('cashier', 'orders:update_kitchen_status'), false, 'Cashier must not update kitchen prep');
  assert.equal(hasPermission('owner', 'menu:manage'), true);
  assert.equal(hasPermission('owner', 'payments:verify'), true);
});

test('Staff PIN: Salted cryptographic hashing and verification', () => {
  const pin = '4321';
  const { pinHash, salt } = hashPin(pin);

  assert.notEqual(pinHash, pin, 'Hash must not match raw pin');
  assert.ok(salt.length >= 16, 'Salt must be sufficiently long');
  assert.equal(verifyPin('4321', pinHash, salt), true, 'Correct PIN must verify');
  assert.equal(verifyPin('0000', pinHash, salt), false, 'Incorrect PIN must fail');
  assert.equal(verifyPin('4322', pinHash, salt), false, 'Near PIN must fail');
});

test('Staff Session Tokens: Signing, tamper-detection and expiration', () => {
  const session = {
    staffId: 's1',
    restaurantId: 'r1',
    name: 'Test Staff',
    role: 'chef',
  };
  const secret = 'super-secret-key-32-chars-minimum-needed';
  const token = createStaffToken(session, secret);

  const decoded = verifyStaffToken(token, secret);
  assert.ok(decoded, 'Valid token must decode');
  assert.equal(decoded.staffId, 's1');
  assert.equal(decoded.role, 'chef');

  // Tamper signature
  const tampered = token.slice(0, -4) + 'abcd';
  assert.equal(verifyStaffToken(tampered, secret), null, 'Tampered token must be rejected');

  // Wrong secret
  assert.equal(verifyStaffToken(token, 'different-secret-key-for-test-32c'), null, 'Wrong secret must be rejected');
});

test('Multi-Tenant Isolation: Cross-tenant payment access denial', async () => {
  OrderRepository.clear();

  // Create order for Restaurant A
  const orderA = {
    id: 'ord_tenant_a',
    restaurantId: 'tenant_a_uuid',
    orderToken: 'BS-20261027-001',
    tableNumber: 'Table 01',
    customerName: 'Alice',
    customerPhone: '+91 98765 00001',
    orderType: 'DINE_IN',
    items: [],
    subtotal: 300,
    tax: 15,
    total: 315,
    paymentMode: 'instant_upi',
    paymentStatus: 'pending',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  OrderRepository.save(orderA);

  // Staff belonging to Restaurant B tries to verify Restaurant A's order
  const staffTenantB = {
    staffId: 'staff_b',
    restaurantId: 'tenant_b_uuid',
    name: 'Cashier Bob',
    role: 'cashier',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 3600000,
  };

  await assert.rejects(
    async () => {
      await verifyOrderPayment(orderA.id, staffTenantB, {
        amount: 315,
        paymentMode: 'instant_upi',
      });
    },
    /Forbidden: Access denied to orders belonging to another restaurant/,
    'Cross-tenant payment verification must be blocked'
  );
});

test('Multi-Tenant Isolation: Cross-tenant KDS status mutation denial', async () => {
  OrderRepository.clear();

  const orderA = {
    id: 'ord_tenant_a_2',
    restaurantId: 'tenant_a_uuid',
    orderToken: 'BS-20261027-002',
    tableNumber: 'Table 02',
    customerName: 'Charlie',
    customerPhone: '+91 98765 00002',
    orderType: 'DINE_IN',
    items: [],
    subtotal: 200,
    tax: 10,
    total: 210,
    paymentMode: 'instant_upi',
    paymentStatus: 'pending',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  OrderRepository.save(orderA);

  // Chef belonging to Restaurant B
  const chefTenantB = {
    staffId: 'chef_b',
    restaurantId: 'tenant_b_uuid',
    name: 'Chef David',
    role: 'chef',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 3600000,
  };

  await assert.rejects(
    async () => {
      await transitionOrderStatus(orderA.id, 'brewing', chefTenantB);
    },
    /Forbidden: Access denied to orders belonging to another restaurant/,
    'Cross-tenant KDS status transition must be blocked'
  );
});

test('Developer Credentials: Scrypt password encryption, verification, and zero plaintext', () => {
  const { hash, salt } = hashPassword('Vg@25121999');
  assert.notEqual(hash, 'Vg@25121999', 'Password must not be stored in plaintext');
  assert.equal(verifyPassword('Vg@25121999', hash, salt), true, 'Correct password must verify');
  assert.equal(verifyPassword('WrongPassword123', hash, salt), false, 'Wrong password must fail');
  assert.equal(verifyPassword('vg@25121999', hash, salt), false, 'Case-sensitive password check must fail');

  // Verify stored DEVELOPER_OPERATOR encrypted credentials
  assert.equal(
    verifyPassword('Vg@25121999', DEVELOPER_OPERATOR.passwordHash, DEVELOPER_OPERATOR.passwordSalt),
    true,
    'Configured developer password must verify against stored scrypt hash'
  );
  assert.equal(
    verifyPin('2512', DEVELOPER_OPERATOR.pinHash, DEVELOPER_OPERATOR.pinSalt),
    true,
    'Configured developer PIN 2512 must verify against stored hash'
  );
  assert.equal(hasPermission(DEVELOPER_OPERATOR.role, 'tenants:manage'), true);
  assert.equal(hasPermission(DEVELOPER_OPERATOR.role, 'restaurant:update'), true);
  assert.equal(hasPermission(DEVELOPER_OPERATOR.role, 'menu:manage'), true);
});

