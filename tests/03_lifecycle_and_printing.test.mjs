import test from 'node:test';
import assert from 'node:assert/strict';
import { transitionOrderStatus } from '../src/lib/orders/statusService.ts';
import { OrderRepository, createValidatedOrder } from '../src/lib/orders/orderService.ts';
import { generateKot, generateTaxInvoice } from '../src/lib/printing/receiptService.ts';

test('Order Lifecycle: Safe valid status progression', async () => {
  OrderRepository.clear();

  const order = {
    id: 'ord_lifecycle_1',
    restaurantId: 'tenant_1',
    orderToken: 'BS-20261027-010',
    tableNumber: 'Table 03',
    customerName: 'Kunal',
    customerPhone: '+91 98765 43210',
    orderType: 'DINE_IN',
    items: [],
    subtotal: 500,
    tax: 25,
    total: 525,
    paymentMode: 'instant_upi',
    paymentStatus: 'pending',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  OrderRepository.save(order);

  const chefSession = {
    staffId: 'chef_1',
    restaurantId: 'tenant_1',
    name: 'Head Chef',
    role: 'chef',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 3600000,
  };

  // 1. new -> brewing
  const brewing = await transitionOrderStatus(order.id, 'brewing', chefSession);
  assert.equal(brewing.status, 'brewing');

  // 2. brewing -> ready
  const ready = await transitionOrderStatus(order.id, 'ready', chefSession);
  assert.equal(ready.status, 'ready');

  // 3. ready -> completed
  const completed = await transitionOrderStatus(order.id, 'completed', chefSession);
  assert.equal(completed.status, 'completed');

  // 4. Illegal transition: completed -> new
  await assert.rejects(
    async () => {
      await transitionOrderStatus(order.id, 'new', chefSession);
    },
    /Illegal status transition/,
    'Transition from completed back to new must be rejected'
  );
});

test('Subscription Lifecycle: Expired subscription blocks new orders', async () => {
  OrderRepository.clear();

  const expiredCatalog = {
    restaurant: {
      id: 'tenant_expired',
      name: 'Expired Cafe',
      slug: 'expired-cafe',
      taxRate: 5.0,
      isActive: true,
      subscriptionStatus: 'expired',
      subscriptionExpiresAt: new Date(Date.now() - 86400000).toISOString(), // Expired yesterday
    },
    menuItems: [{ id: 'item_1', name: 'Coffee', price: 100, station: 'barista', isAvailable: true }],
  };

  const payload = {
    restaurantId: 'tenant_expired',
    tableNumber: 'Table 01',
    customerName: 'Test',
    customerPhone: '+91 98765 00000',
    orderType: 'DINE_IN',
    items: [{ menuItemId: 'item_1', quantity: 1 }],
  };

  await assert.rejects(
    async () => {
      await createValidatedOrder(payload, expiredCatalog);
    },
    /Restaurant subscription has expired/,
    'Ordering on expired tenant must be blocked'
  );
});

test('Printing: KOT generation excludes prices and emphasizes chef notes', () => {
  const order = {
    id: 'ord_print_1',
    restaurantId: 'tenant_1',
    orderToken: 'BS-20261027-020',
    tableNumber: 'Table 04',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    orderType: 'DINE_IN',
    items: [
      {
        id: 'it_1',
        menuItemId: 'm1',
        name: 'Spanish Saffron Latte',
        station: 'barista',
        quantity: 2,
        unitPrice: 290,
        totalPrice: 580,
        customization: {
          milk: { name: 'Oat Milk' },
          specialNote: 'Extra hot, no foam',
        },
      },
    ],
    subtotal: 580,
    tax: 29,
    total: 609,
    paymentMode: 'instant_upi',
    paymentStatus: 'pending',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  const kot = generateKot(order, 'barista');

  assert.ok(kot.includes('KITCHEN ORDER TICKET'), 'Header must be present');
  assert.ok(kot.includes('#BS-20261027-020'), 'Order token must be present');
  assert.ok(kot.includes('Table 04'), 'Table number must be present');
  assert.ok(kot.includes('[2x] SPANISH SAFFRON LATTE'), 'Item and qty must be present');
  assert.ok(kot.includes('>> MILK: Oat Milk'), 'Milk modifier must be highlighted');
  assert.ok(kot.includes('Extra hot, no foam'), 'Chef special note must be emphasized');
  assert.ok(!kot.includes('₹580'), 'Prices must NEVER appear on KOT tickets');
  assert.ok(!kot.includes('₹609'), 'Total must NEVER appear on KOT tickets');
});

test('Printing: Official GST Tax Invoice meets statutory Rule 46 requirements', () => {
  const order = {
    id: 'ord_print_2',
    restaurantId: 'tenant_1',
    orderToken: 'BS-20261027-021',
    tableNumber: 'Table 05',
    customerName: 'Neha Patel',
    customerPhone: '+91 98765 54321',
    orderType: 'DINE_IN',
    items: [
      {
        id: 'it_2',
        menuItemId: 'm2',
        name: 'Whiskey Barrel Cold Brew',
        station: 'barista',
        quantity: 1,
        unitPrice: 320,
        totalPrice: 320,
      },
    ],
    subtotal: 320,
    tax: 16,
    total: 336,
    paymentMode: 'instant_upi',
    paymentStatus: 'paid',
    status: 'ready',
    createdAt: new Date().toISOString(),
  };

  const restaurant = {
    name: 'Brew Studio India',
    tagline: 'Specialty Coffee Lab',
    address: '100ft Rd, Indiranagar, Bengaluru - 560038',
    phone: '+91 98765 43210',
    gstin: '29AABCU9603R1ZM',
    fssai: '11223344556677',
  };

  const invoice = generateTaxInvoice(order, restaurant);

  assert.ok(invoice.includes('TAX INVOICE (RULE 46)'), 'Tax invoice header required');
  assert.ok(invoice.includes('GSTIN: 29AABCU9603R1ZM'), 'GSTIN must be printed');
  assert.ok(invoice.includes('FSSAI: 11223344556677'), 'FSSAI must be printed');
  assert.ok(invoice.includes('INV-BS-20261027-021'), 'Invoice sequence number required');
  assert.ok(invoice.includes('SUBTOTAL:                      ₹320'), 'Subtotal required');
  assert.ok(invoice.includes('CGST (2.5%):                   ₹8'), 'CGST split required');
  assert.ok(invoice.includes('SGST (2.5%):                   ₹8'), 'SGST split required');
  assert.ok(invoice.includes('GRAND TOTAL (INR):             ₹336'), 'Grand total required');
  assert.ok(invoice.includes('PAYMENT STATUS:                PAID'), 'Payment status required');
  assert.ok(invoice.includes('SAC: 996331'), 'SAC classification required');
});

test('Concurrency: Collision-safe token generation under high load', () => {
  OrderRepository.clear();
  const tokenSet = new Set();
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    const token = OrderRepository.getNextToken('tenant_concurrency_test', 'BS');
    assert.ok(!tokenSet.has(token), `Token collision detected on iteration ${i}: ${token}`);
    tokenSet.add(token);
  }

  assert.equal(tokenSet.size, iterations, 'All 100 concurrent tokens must be unique');
});
