import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '@/data/initialMenu';
import { MenuItem, Order } from '@/types';

interface GlobalDemoStore {
  orders: Order[];
  menuItems: MenuItem[];
  lastUpdated: number;
}

const globalForDemo = globalThis as unknown as {
  __brewStudioDemoStore?: GlobalDemoStore;
};

function getStore(): GlobalDemoStore {
  if (!globalForDemo.__brewStudioDemoStore) {
    globalForDemo.__brewStudioDemoStore = {
      orders: [...INITIAL_ORDERS],
      menuItems: [...INITIAL_MENU_ITEMS],
      lastUpdated: Date.now(),
    };
  }
  return globalForDemo.__brewStudioDemoStore;
}

export async function GET() {
  const store = getStore();
  return NextResponse.json(
    {
      orders: store.orders,
      menuItems: store.menuItems,
      lastUpdated: store.lastUpdated,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;
    const store = getStore();

    switch (type) {
      case 'ORDER_CREATED': {
        const newOrder = payload as Order;
        if (newOrder && newOrder.id && !store.orders.some((o) => o.id === newOrder.id)) {
          store.orders = [newOrder, ...store.orders];
          store.lastUpdated = Date.now();
        }
        break;
      }

      case 'ORDER_STATUS_CHANGED': {
        const { orderId, status, updatedAt, prepStartedAt, readyAt, completedAt } = payload || {};
        store.orders = store.orders.map((ord) =>
          ord.id === orderId
            ? {
                ...ord,
                status,
                updatedAt: updatedAt || new Date().toISOString(),
                ...(prepStartedAt ? { prepStartedAt } : {}),
                ...(readyAt ? { readyAt } : {}),
                ...(completedAt ? { completedAt } : {}),
              }
            : ord
        );
        store.lastUpdated = Date.now();
        break;
      }

      case 'ITEM_CHECK_TOGGLED': {
        const { orderId, orderItemId, completedInKitchen } = payload || {};
        store.orders = store.orders.map((ord) => {
          if (ord.id !== orderId) return ord;
          return {
            ...ord,
            items: ord.items.map((item) =>
              item.id === orderItemId ? { ...item, completedInKitchen } : item
            ),
          };
        });
        store.lastUpdated = Date.now();
        break;
      }

      case 'ORDER_PAYMENT_VERIFIED': {
        const { orderId, updatedAt } = payload || {};
        store.orders = store.orders.map((ord) =>
          ord.id === orderId
            ? { ...ord, paymentStatus: 'paid', updatedAt: updatedAt || new Date().toISOString() }
            : ord
        );
        store.lastUpdated = Date.now();
        break;
      }

      case 'MENU_ITEM_AVAILABILITY_TOGGLED': {
        const { itemId, isAvailable } = payload || {};
        store.menuItems = store.menuItems.map((item) =>
          item.id === itemId ? { ...item, isAvailable } : item
        );
        store.lastUpdated = Date.now();
        break;
      }

      case 'MENU_ITEM_UPDATED': {
        const updatedItem = payload as MenuItem;
        if (updatedItem?.id) {
          store.menuItems = store.menuItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          );
          store.lastUpdated = Date.now();
        }
        break;
      }

      case 'MENU_ITEM_ADDED': {
        const newItem = payload as MenuItem;
        if (newItem?.id && !store.menuItems.some((m) => m.id === newItem.id)) {
          store.menuItems = [newItem, ...store.menuItems];
          store.lastUpdated = Date.now();
        }
        break;
      }

      case 'RESET_DEMO_DATA': {
        store.orders = [...INITIAL_ORDERS];
        store.menuItems = [...INITIAL_MENU_ITEMS];
        store.lastUpdated = Date.now();
        break;
      }
    }

    return NextResponse.json({
      ok: true,
      orders: store.orders,
      lastUpdated: store.lastUpdated,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Sync error' },
      { status: 400 }
    );
  }
}

