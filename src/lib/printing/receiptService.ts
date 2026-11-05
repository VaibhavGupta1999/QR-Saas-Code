/**
 * Hospitality OS — Thermal Print & Tax Receipt Engine (80mm Standard)
 * Generates formatted ESC/POS outputs for KOTs, Customer Estimates, and Official Tax Invoices.
 */

import type { ValidatedOrder } from '../orders/orderService.ts';

export interface RestaurantMeta {
  name: string;
  tagline?: string;
  address: string;
  phone: string;
  gstin?: string;
  fssai?: string;
}

/**
 * Generates an 80mm Kitchen Order Ticket (KOT).
 * Strictly for kitchen staff: No prices, highlights modifiers and chef notes.
 */
export function generateKot(
  order: ValidatedOrder,
  station: 'barista' | 'kitchen' | 'all' = 'all'
): string {
  const filteredItems =
    station === 'all'
      ? order.items
      : order.items.filter((item) => item.station === station);

  const lines = [
    '========================================',
    '       *** KITCHEN ORDER TICKET ***      ',
    `STATION: ${station.toUpperCase()}`,
    '========================================',
    `ORDER TOKEN: #${order.orderToken}`,
    `TABLE:       ${order.tableNumber}`,
    `TYPE:        ${order.orderType}`,
    `SERVER TIME: ${new Date(order.createdAt).toLocaleTimeString()}`,
    '----------------------------------------',
    'QTY  ITEM & MODIFIERS',
    '----------------------------------------',
  ];

  filteredItems.forEach((item) => {
    lines.push(`[${item.quantity}x] ${item.name.toUpperCase()}`);
    if (item.customization?.milk?.name) {
      lines.push(`     >> MILK: ${item.customization.milk.name}`);
    }
    if (item.customization?.bean?.name) {
      lines.push(`     >> ROAST: ${item.customization.bean.name}`);
    }
    if (item.customization?.sweetness?.name) {
      lines.push(`     >> SWEETNESS: ${item.customization.sweetness.name}`);
    }
    if (item.customization?.specialNote) {
      lines.push(`     ** NOTE: "${item.customization.specialNote}" **`);
    }
  });

  lines.push('----------------------------------------');
  lines.push(`TOTAL ITEMS: ${filteredItems.reduce((acc, it) => acc + it.quantity, 0)}`);
  lines.push('========================================');

  return lines.join('\n');
}

/**
 * Generates an 80mm Official Tax Invoice (GST Compliant).
 * SAC: 996331 (Restaurant Service). 5% GST (2.5% CGST + 2.5% SGST).
 */
export function generateTaxInvoice(
  order: ValidatedOrder,
  restaurant: RestaurantMeta
): string {
  const halfTax = Math.round(order.tax / 2);

  const lines = [
    '========================================',
    `         ${restaurant.name.toUpperCase()}`,
    restaurant.tagline ? `    ${restaurant.tagline}` : '',
    restaurant.address,
    `Tel: ${restaurant.phone}`,
    restaurant.gstin ? `GSTIN: ${restaurant.gstin}` : '',
    restaurant.fssai ? `FSSAI: ${restaurant.fssai}` : '',
    '========================================',
    '         TAX INVOICE (RULE 46)          ',
    '========================================',
    `INVOICE NO:  INV-${order.orderToken}`,
    `DATE & TIME: ${new Date(order.createdAt).toLocaleString()}`,
    `TABLE/DEST:  ${order.tableNumber}`,
    `GUEST NAME:  ${order.customerName}`,
    `GUEST PHONE: ${order.customerPhone}`,
    '----------------------------------------',
    'QTY  ITEM DESCRIPTION             AMOUNT',
    '----------------------------------------',
  ];

  order.items.forEach((item) => {
    const itemLine = `${item.quantity}x  ${item.name.padEnd(25).slice(0, 25)} ₹${item.totalPrice}`;
    lines.push(itemLine);
    if (item.customization?.milk?.name) {
      lines.push(`    + Milk: ${item.customization.milk.name}`);
    }
    if (item.customization?.bean?.name) {
      lines.push(`    + Bean: ${item.customization.bean.name}`);
    }
  });

  lines.push('----------------------------------------');
  lines.push(`SUBTOTAL:                      ₹${order.subtotal}`);
  lines.push(`CGST (2.5%):                   ₹${halfTax}`);
  lines.push(`SGST (2.5%):                   ₹${halfTax}`);
  lines.push('----------------------------------------');
  lines.push(`GRAND TOTAL (INR):             ₹${order.total}`);
  lines.push(`PAYMENT MODE:                  ${order.paymentMode.toUpperCase()}`);
  lines.push(`PAYMENT STATUS:                ${order.paymentStatus.toUpperCase()}`);
  lines.push('========================================');
  lines.push('  SAC: 996331 (Restaurant Service)     ');
  lines.push('  GST Composition: Standard 5.00% Net   ');
  lines.push('   Thank you! Please visit again.       ');
  lines.push('========================================');

  return lines.filter(Boolean).join('\n');
}
