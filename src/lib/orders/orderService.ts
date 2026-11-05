/**
 * Hospitality OS — Server-Side Order Creation & Price Integrity Service
 * Enforces strict financial calculations, inventory checks, idempotency, and collision-safe tokens.
 */

import { z } from 'zod';
import { logger } from '../logger.ts';

export const CustomizerOptionSchema = z.object({
  temperature: z.string().optional(),
  bean: z.object({ name: z.string(), price: z.number().default(0) }).optional(),
  milk: z.object({ name: z.string(), price: z.number().default(0) }).optional(),
  sweetness: z.object({ name: z.string(), price: z.number().default(0) }).optional(),
  boosters: z.array(z.object({ name: z.string(), price: z.number().default(0) })).optional(),
  specialNote: z.string().max(200).optional(),
});

export const CartItemInputSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID required'),
  quantity: z.number().int().min(1).max(50),
  customization: CustomizerOptionSchema.optional(),
  clientPrice: z.number().optional(), // Client's submitted price (FOR AUDIT & TAMPER DETECTION)
});

export const CreateOrderInputSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID required'),
  tableNumber: z.string().min(1, 'Table number required'),
  customerName: z.string().min(1, 'Customer name required').max(100),
  customerPhone: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Valid phone number required'),
  orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']).default('DINE_IN'),
  deliveryAddress: z.string().max(300).optional(),
  paymentMode: z.enum(['instant_upi', 'upi_counter', 'cash', 'card']).default('instant_upi'),
  items: z.array(CartItemInputSchema).min(1, 'At least one item is required'),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

export interface OrderItemRecord {
  id: string;
  menuItemId: string;
  name: string;
  station: 'barista' | 'kitchen';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: z.infer<typeof CustomizerOptionSchema>;
}

export interface ValidatedOrder {
  id: string;
  restaurantId: string;
  orderToken: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  deliveryAddress?: string;
  items: OrderItemRecord[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMode: 'instant_upi' | 'upi_counter' | 'cash' | 'card';
  paymentStatus: 'pending' | 'paid';
  status: 'new' | 'brewing' | 'ready' | 'completed' | 'cancelled';
  idempotencyKey?: string;
  createdAt: string;
}

// In-Memory Order Repository (Used for tests and fallback before Supabase connection)
export class OrderRepository {
  private static orders = new Map<string, ValidatedOrder>();
  private static idempotencyIndex = new Map<string, string>(); // restaurantId:key -> orderId
  private static sequenceCounter = new Map<string, number>(); // restaurantId:date -> counter

  static clear() {
    this.orders.clear();
    this.idempotencyIndex.clear();
    this.sequenceCounter.clear();
  }

  static findByIdempotency(restaurantId: string, key: string): ValidatedOrder | null {
    const orderId = this.idempotencyIndex.get(`${restaurantId}:${key}`);
    if (!orderId) return null;
    return this.orders.get(orderId) || null;
  }

  static getNextToken(restaurantId: string, prefix = 'BS'): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seqKey = `${restaurantId}:${today}`;
    const nextSeq = (this.sequenceCounter.get(seqKey) || 0) + 1;
    this.sequenceCounter.set(seqKey, nextSeq);
    const padded = String(nextSeq).padStart(3, '0');
    return `${prefix}-${today}-${padded}`;
  }

  static save(order: ValidatedOrder): ValidatedOrder {
    this.orders.set(order.id, order);
    if (order.idempotencyKey) {
      this.idempotencyIndex.set(`${order.restaurantId}:${order.idempotencyKey}`, order.id);
    }
    return order;
  }

  static findById(id: string): ValidatedOrder | null {
    return this.orders.get(id) || null;
  }

  static findByRestaurant(restaurantId: string): ValidatedOrder[] {
    return Array.from(this.orders.values())
      .filter((o) => o.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static update(order: ValidatedOrder): ValidatedOrder {
    this.orders.set(order.id, order);
    return order;
  }
}

/**
 * Validates and processes order creation with independent server-side pricing.
 * Rejects client price tampering and guarantees atomic idempotent execution.
 */
export async function createValidatedOrder(
  rawInput: unknown,
  restaurantCatalog: {
    restaurant: {
      id: string;
      name: string;
      slug: string;
      taxRate: number; // e.g. 5.0 for 5%
      isActive: boolean;
      subscriptionStatus: string;
      subscriptionExpiresAt: string;
    };
    menuItems: Array<{
      id: string;
      name: string;
      price: number;
      station: 'barista' | 'kitchen';
      isAvailable: boolean;
      allowsCustomization?: boolean;
    }>;
    modifiers?: Array<{
      type: string;
      name: string;
      extraPrice: number;
      isAvailable: boolean;
    }>;
  }
): Promise<{ order: ValidatedOrder; isDuplicateRetry: boolean }> {
  // 1. Zod Input Schema Validation
  const input = CreateOrderInputSchema.parse(rawInput);
  const { restaurant, menuItems, modifiers = [] } = restaurantCatalog;

  // 2. Tenant Subscription Check
  if (!restaurant.isActive || restaurant.subscriptionStatus === 'suspended') {
    throw new Error('Restaurant account is currently suspended.');
  }

  if (new Date(restaurant.subscriptionExpiresAt).getTime() < Date.now()) {
    throw new Error('Restaurant subscription has expired. Please contact restaurant administration.');
  }

  // 3. Idempotency Check (Prevent duplicate orders on network retry)
  if (input.idempotencyKey) {
    const existing = OrderRepository.findByIdempotency(input.restaurantId, input.idempotencyKey);
    if (existing) {
      logger.info('Duplicate order submission intercepted by idempotency key', {
        idempotencyKey: input.idempotencyKey,
        orderId: existing.id,
      });
      return { order: existing, isDuplicateRetry: true };
    }
  }

  // 4. Server-Side Price & Availability Validation
  const itemMap = new Map(menuItems.map((m) => [m.id, m]));
  const modifierPriceMap = new Map(
    modifiers.map((mod) => [`${mod.type}:${mod.name.toLowerCase()}`, mod])
  );

  let subtotal = 0;
  const validatedItems: OrderItemRecord[] = [];

  for (let idx = 0; idx < input.items.length; idx++) {
    const cartItem = input.items[idx];
    const serverItem = itemMap.get(cartItem.menuItemId);

    if (!serverItem) {
      throw new Error(`Item ${cartItem.menuItemId} does not exist in the restaurant menu.`);
    }

    if (!serverItem.isAvailable) {
      throw new Error(`"${serverItem.name}" is currently sold out (86ed) and cannot be ordered.`);
    }

    // Start with server's authorized price
    let unitPrice = serverItem.price;

    // Validate modifier prices independently from server modifier catalog
    if (cartItem.customization) {
      const cust = cartItem.customization;
      if (cust.bean?.name) {
        const mod = modifierPriceMap.get(`bean:${cust.bean.name.toLowerCase()}`);
        if (mod && mod.isAvailable) unitPrice += mod.extraPrice;
      }
      if (cust.milk?.name) {
        const mod = modifierPriceMap.get(`milk:${cust.milk.name.toLowerCase()}`);
        if (mod && mod.isAvailable) unitPrice += mod.extraPrice;
      }
      if (cust.sweetness?.name) {
        const mod = modifierPriceMap.get(`sweetness:${cust.sweetness.name.toLowerCase()}`);
        if (mod && mod.isAvailable) unitPrice += mod.extraPrice;
      }
      if (cust.boosters && cust.boosters.length > 0) {
        for (const booster of cust.boosters) {
          const mod = modifierPriceMap.get(`booster:${booster.name.toLowerCase()}`);
          if (mod && mod.isAvailable) unitPrice += mod.extraPrice;
        }
      }
    }

    // Detect Client Price Tampering for Security Logs
    if (cartItem.clientPrice !== undefined && cartItem.clientPrice !== unitPrice) {
      logger.warn('Price tampering detected and overridden by server price', {
        itemId: serverItem.id,
        submittedClientPrice: cartItem.clientPrice,
        authorizedServerPrice: unitPrice,
      });
    }

    const itemTotal = unitPrice * cartItem.quantity;
    subtotal += itemTotal;

    validatedItems.push({
      id: `item-${Date.now()}-${idx + 1}`,
      menuItemId: serverItem.id,
      name: serverItem.name,
      station: serverItem.station,
      quantity: cartItem.quantity,
      unitPrice,
      totalPrice: itemTotal,
      customization: cartItem.customization,
    });
  }

  // 5. Accurate Tax Calculation (Indian GST 5%: 2.5% CGST + 2.5% SGST)
  const taxRate = restaurant.taxRate || 5.0;
  const tax = Math.round(subtotal * (taxRate / 100));
  const grandTotal = subtotal + tax;

  // 6. Generate Collision-Safe Sequential Token
  const orderToken = OrderRepository.getNextToken(input.restaurantId, 'BS');
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  // 7. Assemble Validated Order Object
  const newOrder: ValidatedOrder = {
    id: orderId,
    restaurantId: input.restaurantId,
    orderToken,
    tableNumber: input.tableNumber,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    orderType: input.orderType,
    deliveryAddress: input.deliveryAddress?.trim(),
    items: validatedItems,
    subtotal,
    tax,
    total: grandTotal,
    paymentMode: input.paymentMode,
    paymentStatus: 'pending', // NEVER mark paid on client assertion!
    status: 'new',
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
  };

  // 8. Atomic Persistence
  OrderRepository.save(newOrder);

  logger.info('Order successfully created with server pricing verification', {
    orderId: newOrder.id,
    orderToken: newOrder.orderToken,
    total: newOrder.total,
    itemCount: validatedItems.length,
  });

  return { order: newOrder, isDuplicateRetry: false };
}
