export type MenuCategoryKey = 'hot-coffee' | 'iced-coffee' | 'manual' | 'non-coffee' | 'signatures' | 'espresso' | 'bakehouse';

export type MoodKey = 'all' | 'high-caffeine' | 'cold' | 'sweet' | 'manual' | 'food';

export type RoastLevel = 'Light' | 'Light-Medium' | 'Medium' | 'Medium-Dark' | 'Dark';

export type Station = 'barista' | 'kitchen';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: MenuCategoryKey;
  categoryName: string;
  description: string;
  image: string;
  badge?: 'Bestseller' | "Barista's Pick" | 'Trending on IG' | 'New' | 'Chef Special';
  tastingNotes: string[];
  roastLevel?: RoastLevel;
  caffeineIntensity: 1 | 2 | 3 | 4 | 5; // out of 5
  calories: number;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  station: Station;
  pairingItemIds?: string[];
  moods: MoodKey[];
  allowsCustomization?: boolean;
}

export interface CustomizationOptions {
  temperature: 'Hot 🔥' | 'Iced 🧊';
  bean: {
    name: string;
    price: number;
  };
  milk: {
    name: string;
    price: number;
  };
  sweetness: {
    name: string;
    price: number;
  };
  boosters: {
    name: string;
    price: number;
  }[];
  specialNote: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customization?: CustomizationOptions;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'new' | 'brewing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItemRecord {
  id: string;
  menuItemId: string;
  name: string;
  category: MenuCategoryKey;
  station: Station;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: CustomizationOptions;
  completedInKitchen?: boolean;
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export interface Order {
  id: string; // e.g. "BS-104"
  customerName: string;
  customerPhone?: string; // e.g. "+91 98765 43210"
  orderType?: OrderType;
  tableNumber: string; // e.g. "Table 04", "Takeaway Counter", or Delivery Address
  deliveryAddress?: string;
  items: OrderItemRecord[];
  subtotal: number;
  tax: number; // 5% GST
  total: number;
  paymentMode: 'upi_counter' | 'instant_upi';
  paymentStatus: 'paid' | 'pending';
  status: OrderStatus;
  createdAt: string; // ISO string
  updatedAt: string;
  prepStartedAt?: string;
  readyAt?: string;
  completedAt?: string;
}

export type SyncActionType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_PAYMENT_VERIFIED'
  | 'ITEM_CHECK_TOGGLED'
  | 'MENU_ITEM_AVAILABILITY_TOGGLED'
  | 'MENU_ITEM_UPDATED'
  | 'MENU_ITEM_ADDED'
  | 'RESET_DEMO_DATA';

export interface SyncMessage {
  type: SyncActionType;
  payload: any;
  timestamp: number;
}

export interface AdminStats {
  todayRevenue: number;
  totalOrders: number;
  activeKitchenTickets: number;
  bestSellingItem: string;
  averageOrderValue: number;
}
