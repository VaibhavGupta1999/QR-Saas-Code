/**
 * Hospitality OS — Order Lifecycle & Status Transition State Machine
 * Enforces strict valid state progression and logs staff attribution.
 */

import { OrderRepository, type ValidatedOrder } from './orderService.ts';
import { type StaffSession, hasPermission } from '../security/rbac.ts';
import { logger } from '../logger.ts';

export type OrderStatus = 'new' | 'brewing' | 'ready' | 'completed' | 'cancelled';

const LEGAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['brewing', 'cancelled'],
  brewing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

export async function transitionOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  staffSession: StaffSession
): Promise<ValidatedOrder> {
  // 1. Authorization Check (Chef, Manager, Owner)
  if (!hasPermission(staffSession.role, 'orders:update_kitchen_status') && !hasPermission(staffSession.role, 'orders:update_status')) {
    throw new Error(`Forbidden: Staff role "${staffSession.role}" cannot change order status.`);
  }

  // 2. Fetch Order
  const order = OrderRepository.findById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  // 3. Multi-Tenant Check
  if (order.restaurantId !== staffSession.restaurantId && staffSession.role !== 'platform_operator') {
    throw new Error('Forbidden: Access denied to orders belonging to another restaurant.');
  }

  // 4. Legal Transition Check
  const currentStatus = order.status;
  const allowedNext = LEGAL_TRANSITIONS[currentStatus] || [];

  if (!allowedNext.includes(newStatus)) {
    throw new Error(
      `Illegal status transition: Cannot move order #${order.orderToken} from "${currentStatus}" to "${newStatus}".`
    );
  }

  // 5. Update Status
  order.status = newStatus;
  OrderRepository.update(order);

  logger.info('Order status transitioned successfully', {
    orderId: order.id,
    orderToken: order.orderToken,
    previousStatus: currentStatus,
    newStatus,
    updatedBy: staffSession.name,
  });

  return order;
}
