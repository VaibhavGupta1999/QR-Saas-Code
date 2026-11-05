import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createValidatedOrder,
  OrderRepository,
} from '../src/lib/orders/orderService.ts';
import { verifyOrderPayment } from '../src/lib/orders/paymentService.ts';

const mockCatalog = {
  restaurant: {
    id: 'tenant_test_1',
    name: 'Brew Studio India',
    slug: 'brew-studio',
    taxRate: 5.0,
    isActive: true,
    subscriptionStatus: 'active',
    subscriptionExpiresAt: new Date(Date.now() + 864000000).toISOString(),
  },
  menuItems: [
    {
      id: 'item_cold_brew',
      name: 'Whiskey Barrel Cold Brew',
      price: 320.0,
      station: 'barista',
      isAvailable: true,
      allowsCustomization: true,
    },
    {
      id: 'item_sold_out_croissant',
      name: 'Almond Croissant',
      price: 240.0,
      station: 'kitchen',
      isAvailable: false, // 86ed
    },
  ],
  modifiers: [
    { type: 'milk', name: 'Oat Milk (+₹45)', extraPrice: 45.0, isAvailable: true },
    { type: 'booster', name: 'Vanilla Infusion', extraPrice: 35.0, isAvailable: true },
  ],
};

test('Order Integrity: Client price manipulation is rejected and overridden by server', async () => {
  OrderRepository.clear();

  const tamperedPayload = {
    restaurantId: 'tenant_test_1',
    tableNumber: 'Table 04',
    customerName: 'Aarav',
    customerPhone: '+91 98765 43210',
    orderType: 'DINE_IN',
    paymentMode: 'instant_upi',
    items: [
      {
        menuItemId: 'item_cold_brew',
        quantity: 2,
        clientPrice: 1.0, // Malicious attempt to pay ₹1 instead of ₹320!
      },
    ],
  };

  const { order } = await createValidatedOrder(tamperedPayload, mockCatalog);

  // Expected subtotal: 2 * 320 = 640
  // Tax (5%): 640 * 0.05 = 32
  // Total: 672
  assert.equal(order.items[0].unitPrice, 320.0, 'Server must enforce official price ₹320');
  assert.equal(order.subtotal, 640.0, 'Subtotal must be ₹640, not ₹2');
  assert.equal(order.tax, 32.0, 'Tax must be calculated on true subtotal');
  assert.equal(order.total, 672.0, 'Total must be ₹672, not ₹2.10');
  assert.equal(order.paymentStatus, 'pending', 'Order must be PENDING payment');
});

test('Order Integrity: Modifiers are independently priced by server catalog', async () => {
  OrderRepository.clear();

  const payload = {
    restaurantId: 'tenant_test_1',
    tableNumber: 'Table 04',
    customerName: 'Pooja',
    customerPhone: '+91 98765 43211',
    orderType: 'DINE_IN',
    paymentMode: 'instant_upi',
    items: [
      {
        menuItemId: 'item_cold_brew',
        quantity: 1,
        customization: {
          milk: { name: 'Oat Milk (+₹45)', price: 0 },
          boosters: [{ name: 'Vanilla Infusion', price: 0 }],
        },
      },
    ],
  };

  const { order } = await createValidatedOrder(payload, mockCatalog);

  // Expected: 320 (base) + 45 (oat) + 35 (vanilla) = 400
  // Tax (5%): 400 * 0.05 = 20
  // Total: 420
  assert.equal(order.items[0].unitPrice, 400.0, 'Modifiers must be added by server');
  assert.equal(order.subtotal, 400.0);
  assert.equal(order.tax, 20.0);
  assert.equal(order.total, 420.0);
});

test('Order Integrity: Sold-out (86ed) items are blocked during checkout', async () => {
  OrderRepository.clear();

  const payload = {
    restaurantId: 'tenant_test_1',
    tableNumber: 'Table 04',
    customerName: 'Rahul',
    customerPhone: '+91 98765 43212',
    orderType: 'DINE_IN',
    items: [
      {
        menuItemId: 'item_sold_out_croissant',
        quantity: 1,
      },
    ],
  };

  await assert.rejects(
    async () => {
      await createValidatedOrder(payload, mockCatalog);
    },
    /is currently sold out \(86ed\) and cannot be ordered/,
    'Checkout with sold out item must be blocked'
  );
});

test('Order Idempotency: Duplicate network submissions return existing order', async () => {
  OrderRepository.clear();

  const payload = {
    restaurantId: 'tenant_test_1',
    tableNumber: 'Table 04',
    customerName: 'Sanjay',
    customerPhone: '+91 98765 43213',
    orderType: 'DINE_IN',
    idempotencyKey: 'idem_key_unique_12345678',
    items: [
      {
        menuItemId: 'item_cold_brew',
        quantity: 1,
      },
    ],
  };

  // First request
  const first = await createValidatedOrder(payload, mockCatalog);
  assert.equal(first.isDuplicateRetry, false);

  // Duplicate retry request
  const retry = await createValidatedOrder(payload, mockCatalog);
  assert.equal(retry.isDuplicateRetry, true, 'Retry must be flagged as duplicate');
  assert.equal(retry.order.id, first.order.id, 'Same order ID must be returned');
  assert.equal(retry.order.orderToken, first.order.orderToken);
});

test('Payment Integrity: Cashier reconciliation and double-payment prevention', async () => {
  OrderRepository.clear();

  const payload = {
    restaurantId: 'tenant_test_1',
    tableNumber: 'Table 04',
    customerName: 'Meera',
    customerPhone: '+91 98765 43214',
    orderType: 'DINE_IN',
    items: [{ menuItemId: 'item_cold_brew', quantity: 1 }],
  };

  const { order } = await createValidatedOrder(payload, mockCatalog);
  assert.equal(order.paymentStatus, 'pending');

  const cashierSession = {
    staffId: 'staff_cashier_1',
    restaurantId: 'tenant_test_1',
    name: 'Priya Cashier',
    role: 'cashier',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 3600000,
  };

  // Verify payment
  const { order: paidOrder, payment } = await verifyOrderPayment(order.id, cashierSession, {
    amount: order.total,
    paymentMode: 'instant_upi',
    transactionReference: 'UPI-UTR-987654321012',
  });

  assert.equal(paidOrder.paymentStatus, 'paid');
  assert.equal(payment.transactionReference, 'UPI-UTR-987654321012');

  // Attempt duplicate payment on already-paid order
  await assert.rejects(
    async () => {
      await verifyOrderPayment(order.id, cashierSession, {
        amount: order.total,
        paymentMode: 'instant_upi',
      });
    },
    /already marked as PAID/,
    'Double-payment must be rejected'
  );
});
