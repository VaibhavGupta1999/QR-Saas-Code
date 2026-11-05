/**
 * Hospitality OS — Payment Ledger & Verification Service
 * Handles cashier reconciliation, transaction reference audits, and double-payment prevention.
 */

import { OrderRepository, type ValidatedOrder } from './orderService.ts';
import { type StaffSession, hasPermission } from '../security/rbac.ts';
import { logger } from '../logger.ts';

export interface PaymentRecord {
  id: string;
  orderId: string;
  restaurantId: string;
  amount: number;
  paymentMode: string;
  transactionReference?: string;
  verifiedByStaffId: string;
  verifiedByStaffName: string;
  verifiedAt: string;
  status: 'verified' | 'rejected' | 'refunded';
  notes?: string;
}

export class PaymentRepository {
  private static payments = new Map<string, PaymentRecord>();

  static clear() {
    this.payments.clear();
  }

  static save(payment: PaymentRecord): PaymentRecord {
    this.payments.set(payment.id, payment);
    return payment;
  }

  static findByOrder(orderId: string): PaymentRecord[] {
    return Array.from(this.payments.values()).filter((p) => p.orderId === orderId);
  }
}

export async function verifyOrderPayment(
  orderId: string,
  staffSession: StaffSession,
  paymentDetails: {
    amount: number;
    paymentMode: 'instant_upi' | 'upi_counter' | 'cash' | 'card';
    transactionReference?: string;
    notes?: string;
  }
): Promise<{ order: ValidatedOrder; payment: PaymentRecord }> {
  // 1. Authorization Check (Cashier, Manager, Owner only)
  if (!hasPermission(staffSession.role, 'payments:verify')) {
    throw new Error(`Forbidden: Staff role "${staffSession.role}" cannot verify payments.`);
  }

  // 2. Fetch Order
  const order = OrderRepository.findById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  // 3. Multi-Tenant Boundary Check
  if (order.restaurantId !== staffSession.restaurantId && staffSession.role !== 'platform_operator') {
    throw new Error('Forbidden: Access denied to orders belonging to another restaurant.');
  }

  // 4. Double-Payment Prevention
  if (order.paymentStatus === 'paid') {
    throw new Error(`Order #${order.orderToken} is already marked as PAID.`);
  }

  // 5. Amount Sanity Check
  if (paymentDetails.amount < order.total) {
    throw new Error(
      `Insufficient payment amount: Received ₹${paymentDetails.amount}, expected ₹${order.total}.`
    );
  }

  // 6. Record Payment in Ledger
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const paymentRecord: PaymentRecord = {
    id: paymentId,
    orderId: order.id,
    restaurantId: order.restaurantId,
    amount: paymentDetails.amount,
    paymentMode: paymentDetails.paymentMode,
    transactionReference: paymentDetails.transactionReference,
    verifiedByStaffId: staffSession.staffId,
    verifiedByStaffName: staffSession.name,
    verifiedAt: now,
    status: 'verified',
    notes: paymentDetails.notes,
  };

  PaymentRepository.save(paymentRecord);

  // 7. Update Order State
  order.paymentStatus = 'paid';
  OrderRepository.update(order);

  logger.info('Payment verified and recorded in ledger', {
    orderId: order.id,
    orderToken: order.orderToken,
    amount: paymentRecord.amount,
    verifiedBy: staffSession.name,
    transactionReference: paymentDetails.transactionReference,
  });

  return { order, payment: paymentRecord };
}
