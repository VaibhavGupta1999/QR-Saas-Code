'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  MenuItem,
  Order,
  OrderType,
  CartItem,
  CustomizationOptions,
  OrderStatus,
  SyncMessage,
  Station,
} from '@/types';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '@/data/initialMenu';
import { playCafeOrderChime, playOrderReadyChime } from '@/utils/sound';

interface BrewStudioContextType {
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  soundEnabled: boolean;
  currentTable: string;
  activeOrder: Order | null;
  // Cart Actions
  addToCart: (menuItem: MenuItem, customization?: CustomizationOptions, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  // Order Actions
  placeOrder: (
    customerName?: string,
    customerPhone?: string,
    tableNumber?: string,
    paymentMode?: 'upi_counter' | 'instant_upi',
    orderType?: import('@/types').OrderType,
    deliveryAddress?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  verifyOrderPayment: (orderId: string) => void;
  toggleOrderItemCheck: (orderId: string, orderItemId: string) => void;
  cancelOrder: (orderId: string) => void;
  setActiveOrderById: (orderId: string | null) => void;
  // Menu Engineering Actions (Admin)
  toggleItemAvailability: (itemId: string) => void;
  toggleItemFeatured: (itemId: string) => void;
  updateItemPrice: (itemId: string, newPrice: number) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  // Customer Profile & Onboarding
  customerName: string;
  customerPhone: string;
  orderType: import('@/types').OrderType;
  deliveryAddress: string;
  isOnboarded: boolean;
  completeOnboarding: (info: {
    name: string;
    phone: string;
    orderType: import('@/types').OrderType;
    deliveryAddress?: string;
    tableNumber?: string;
  }) => void;
  updateCustomerProfile: (info: {
    name?: string;
    phone?: string;
    orderType?: import('@/types').OrderType;
    deliveryAddress?: string;
    tableNumber?: string;
  }) => void;
  resetOnboarding: () => void;
  // Utilities
  toggleSound: () => void;
  setCurrentTable: (table: string) => void;
  resetToDemoDefaults: () => void;
  seedRandomOrder: (tableOverride?: string) => Order;
}

const BrewStudioContext = createContext<BrewStudioContextType | undefined>(undefined);

const STORAGE_KEY_MENU = 'brew_studio_menu_v1';
const STORAGE_KEY_ORDERS = 'brew_studio_orders_v1';
const STORAGE_KEY_SOUND = 'brew_studio_sound_v1';
const STORAGE_KEY_ACTIVE_ORDER = 'brew_studio_active_order_v1';
const STORAGE_KEY_CUSTOMER = 'brew_studio_customer_v1';
const BROADCAST_CHANNEL_NAME = 'brew_studio_realtime_channel';

export const BrewStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_MENU);
        if (saved) {
          const parsed: MenuItem[] = JSON.parse(saved);
          const cleaned = parsed.filter(
            (m) => m && m.name && !/^[asdfjkl;]+$/i.test(m.name.trim())
          );
          return cleaned.length > 0 ? cleaned : INITIAL_MENU_ITEMS;
        }
      } catch (e) {
        console.error('Error loading menu from localStorage:', e);
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading orders from localStorage:', e);
      }
    }
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentTable, setCurrentTable] = useState<string>('Table 04');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Customer Profile & Onboarding State
  const [customerName, setCustomerName] = useState<string>('Aarav Sharma');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98765 43210');
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  // Broadcast Channel instance
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  // Save sound setting and customer session to/from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
      const savedActiveOrderId = localStorage.getItem(STORAGE_KEY_ACTIVE_ORDER);
      if (savedActiveOrderId) {
        setActiveOrderId(savedActiveOrderId);
      }
      try {
        const savedCustomer = localStorage.getItem(STORAGE_KEY_CUSTOMER);
        if (savedCustomer) {
          const parsed = JSON.parse(savedCustomer);
          if (parsed.name) setCustomerName(parsed.name);
          if (parsed.phone) setCustomerPhone(parsed.phone);
          if (parsed.orderType) setOrderType(parsed.orderType);
          if (parsed.deliveryAddress) setDeliveryAddress(parsed.deliveryAddress);
          if (parsed.isOnboarded !== undefined) setIsOnboarded(Boolean(parsed.isOnboarded));
        }
      } catch (e) {
        console.error('Error loading customer session:', e);
      }
    }
  }, []);

  const completeOnboarding = useCallback(
    (info: {
      name: string;
      phone: string;
      orderType: OrderType;
      deliveryAddress?: string;
      tableNumber?: string;
    }) => {
      setCustomerName(info.name);
      setCustomerPhone(info.phone);
      setOrderType(info.orderType);
      if (info.deliveryAddress !== undefined) setDeliveryAddress(info.deliveryAddress);
      if (info.tableNumber) setCurrentTable(info.tableNumber);
      setIsOnboarded(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY_CUSTOMER,
          JSON.stringify({
            name: info.name,
            phone: info.phone,
            orderType: info.orderType,
            deliveryAddress: info.deliveryAddress || '',
            isOnboarded: true,
          })
        );
      }
    },
    [setCurrentTable]
  );

  const updateCustomerProfile = useCallback(
    (info: {
      name?: string;
      phone?: string;
      orderType?: OrderType;
      deliveryAddress?: string;
      tableNumber?: string;
    }) => {
      if (info.name !== undefined) setCustomerName(info.name);
      if (info.phone !== undefined) setCustomerPhone(info.phone);
      if (info.orderType !== undefined) setOrderType(info.orderType);
      if (info.deliveryAddress !== undefined) setDeliveryAddress(info.deliveryAddress);
      if (info.tableNumber !== undefined) setCurrentTable(info.tableNumber);

      if (typeof window !== 'undefined') {
        try {
          const existing = localStorage.getItem(STORAGE_KEY_CUSTOMER);
          const parsed = existing ? JSON.parse(existing) : {};
          localStorage.setItem(
            STORAGE_KEY_CUSTOMER,
            JSON.stringify({
              ...parsed,
              ...info,
              isOnboarded: true,
            })
          );
        } catch {
          // ignore
        }
      }
    },
    [setCurrentTable]
  );

  const resetOnboarding = useCallback(() => {
    setIsOnboarded(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CUSTOMER);
    }
  }, []);

  // Broadcast sender helper (BroadcastChannel for same-device tabs + /api/demo-sync for cross-device QR scans)
  const broadcast = useCallback(
    (message: SyncMessage) => {
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage(message);
        } catch (e) {
          console.warn('BroadcastChannel error:', e);
        }
      }
      if (typeof window !== 'undefined') {
        fetch('/api/demo-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        }).catch(() => {
          // Non-blocking fallback
        });
      }
    },
    [broadcastChannel]
  );

  // Poll /api/demo-sync every 2.5s so mobile phone QR orders appear live on laptop KDS & Admin
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;

    const syncFromServer = async () => {
      try {
        const res = await fetch('/api/demo-sync', { cache: 'no-store' });
        if (!res.ok || !isMounted) return;
        const data = await res.json();
        if (!Array.isArray(data.orders)) return;

        setOrders((prev) => {
          const remoteOrders: Order[] = data.orders;
          const prevMap = new Map(prev.map((o) => [o.id, o]));
          let hasNewOrder = false;
          let hasChanges = false;

          remoteOrders.forEach((ro) => {
            const existing = prevMap.get(ro.id);
            if (!existing) {
              prevMap.set(ro.id, ro);
              hasNewOrder = true;
              hasChanges = true;
            } else if (
              new Date(ro.updatedAt).getTime() > new Date(existing.updatedAt).getTime() ||
              ro.status !== existing.status ||
              ro.paymentStatus !== existing.paymentStatus
            ) {
              prevMap.set(ro.id, ro);
              hasChanges = true;
            }
          });

          if (hasNewOrder && soundEnabled) {
            playCafeOrderChime();
          }

          if (!hasChanges) return prev;
          return Array.from(prevMap.values());
        });
      } catch {
        // Ignore network errors
      }
    };

    const interval = setInterval(syncFromServer, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [soundEnabled]);

  // Initialize BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    setBroadcastChannel(channel);

    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'ORDER_CREATED': {
          const newOrder = payload as Order;
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
          if (soundEnabled) {
            playCafeOrderChime();
          }
          break;
        }

        case 'ORDER_STATUS_CHANGED': {
          const { orderId, status, updatedAt, prepStartedAt, readyAt, completedAt } = payload;
          setOrders((prev) =>
            prev.map((ord) =>
              ord.id === orderId
                ? {
                    ...ord,
                    status,
                    updatedAt,
                    ...(prepStartedAt ? { prepStartedAt } : {}),
                    ...(readyAt ? { readyAt } : {}),
                    ...(completedAt ? { completedAt } : {}),
                  }
                : ord
            )
          );
          if (status === 'ready' && soundEnabled) {
            playOrderReadyChime();
          }
          break;
        }

        case 'ORDER_PAYMENT_VERIFIED': {
          const { orderId, updatedAt } = payload;
          setOrders((prev) =>
            prev.map((ord) =>
              ord.id === orderId
                ? {
                    ...ord,
                    paymentStatus: 'paid',
                    updatedAt,
                  }
                : ord
            )
          );
          break;
        }

        case 'ITEM_CHECK_TOGGLED': {
          const { orderId, orderItemId, completedInKitchen } = payload;
          setOrders((prev) =>
            prev.map((ord) => {
              if (ord.id !== orderId) return ord;
              return {
                ...ord,
                items: ord.items.map((item) =>
                  item.id === orderItemId ? { ...item, completedInKitchen } : item
                ),
              };
            })
          );
          break;
        }

        case 'MENU_ITEM_AVAILABILITY_TOGGLED': {
          const { itemId, isAvailable } = payload;
          setMenuItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, isAvailable } : item))
          );
          break;
        }

        case 'MENU_ITEM_UPDATED': {
          const updatedItem = payload as MenuItem;
          setMenuItems((prev) =>
            prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
          );
          break;
        }

        case 'MENU_ITEM_ADDED': {
          const newItem = payload as MenuItem;
          setMenuItems((prev) => [newItem, ...prev]);
          break;
        }

        case 'RESET_DEMO_DATA': {
          setMenuItems(INITIAL_MENU_ITEMS);
          setOrders(INITIAL_ORDERS);
          setCart([]);
          localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(INITIAL_MENU_ITEMS));
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
          break;
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [soundEnabled]);

  // Persist menuItems to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menuItems));
    }
  }, [menuItems]);

  // Persist orders to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    }
  }, [orders]);

  // Active order object for customer live tracker
  const activeOrder = useMemo(() => {
    if (!activeOrderId) return null;
    return orders.find((o) => o.id === activeOrderId) || null;
  }, [activeOrderId, orders]);

  // Cart helper metrics
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cart]);

  // Cart operations
  const addToCart = useCallback(
    (menuItem: MenuItem, customization?: CustomizationOptions, quantity = 1) => {
      let unitPrice = menuItem.price;
      if (customization) {
        unitPrice += (customization.bean?.price || 0) +
          (customization.milk?.price || 0) +
          (customization.sweetness?.price || 0) +
          (customization.boosters?.reduce((s, b) => s + b.price, 0) || 0);
      }

      const cartItemId = `${menuItem.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newItem: CartItem = {
        cartItemId,
        menuItem,
        quantity,
        customization,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };

      setCart((prev) => [...prev, newItem]);
    },
    []
  );

  const updateCartQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId !== cartItemId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty,
          };
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Place order from customer view
  const placeOrder = useCallback(
    (
      custName?: string,
      custPhone?: string,
      tableNum?: string,
      paymentMode: 'upi_counter' | 'instant_upi' = 'instant_upi',
      ordType?: OrderType,
      delivAddress?: string
    ) => {
      const now = new Date().toISOString();
      const tokenNum = Math.floor(100 + Math.random() * 900);
      const orderId = `BS-${tokenNum}`;

      const items = cart.map((cItem, idx) => ({
        id: `item-${orderId}-${idx + 1}`,
        menuItemId: cItem.menuItem.id,
        name: cItem.menuItem.name,
        category: cItem.menuItem.category,
        station: cItem.menuItem.station,
        quantity: cItem.quantity,
        unitPrice: cItem.unitPrice,
        totalPrice: cItem.totalPrice,
        customization: cItem.customization,
        completedInKitchen: false,
      }));

      const subtotal = cartSubtotal;
      const tax = Math.round(subtotal * 0.05); // 5% GST
      const total = subtotal + tax;

      const finalOrderType = ordType || orderType || 'DINE_IN';
      let finalTable = tableNum || currentTable;
      if (finalOrderType === 'TAKEAWAY') {
        finalTable = 'Takeaway Counter';
      } else if (finalOrderType === 'DELIVERY') {
        const addr = delivAddress || deliveryAddress || '';
        finalTable = addr ? `Delivery · ${addr.slice(0, 24)}` : 'Delivery · Doorstep';
      }

      const newOrder: Order = {
        id: orderId,
        customerName: (custName || customerName || 'Valued Guest').trim(),
        customerPhone: (custPhone || customerPhone || '').trim() || undefined,
        orderType: finalOrderType,
        tableNumber: finalTable,
        deliveryAddress: delivAddress || deliveryAddress || undefined,
        items,
        subtotal,
        tax,
        total,
        paymentMode,
        paymentStatus: paymentMode === 'instant_upi' ? 'paid' : 'pending',
        status: 'new',
        createdAt: now,
        updatedAt: now,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setActiveOrderId(newOrder.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ORDER, newOrder.id);
      }
      clearCart();

      // Sound chime locally
      if (soundEnabled) {
        playCafeOrderChime();
      }

      // Broadcast to other tabs (KDS, Admin)
      broadcast({
        type: 'ORDER_CREATED',
        payload: newOrder,
        timestamp: Date.now(),
      });

      return newOrder;
    },
    [cart, cartSubtotal, currentTable, orderType, customerName, customerPhone, deliveryAddress, clearCart, soundEnabled, broadcast]
  );

  // Update order status (KDS actions)
  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const now = new Date().toISOString();
      let prepStartedAt: string | undefined;
      let readyAt: string | undefined;
      let completedAt: string | undefined;

      if (status === 'brewing') prepStartedAt = now;
      if (status === 'ready') readyAt = now;
      if (status === 'completed') completedAt = now;

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id !== orderId) return ord;
          return {
            ...ord,
            status,
            updatedAt: now,
            ...(prepStartedAt ? { prepStartedAt } : {}),
            ...(readyAt ? { readyAt } : {}),
            ...(completedAt ? { completedAt } : {}),
          };
        })
      );

      if (status === 'ready' && soundEnabled) {
        playOrderReadyChime();
      }

      broadcast({
        type: 'ORDER_STATUS_CHANGED',
        payload: {
          orderId,
          status,
          updatedAt: now,
          prepStartedAt,
          readyAt,
          completedAt,
        },
        timestamp: Date.now(),
      });
    },
    [soundEnabled, broadcast]
  );

  // Verify order payment (Cashier / Admin reconciliation)
  const verifyOrderPayment = useCallback(
    (orderId: string) => {
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId
            ? {
                ...ord,
                paymentStatus: 'paid',
                updatedAt: now,
              }
            : ord
        )
      );

      broadcast({
        type: 'ORDER_PAYMENT_VERIFIED',
        payload: { orderId, updatedAt: now },
        timestamp: Date.now(),
      });
    },
    [broadcast]
  );

  // Barista item checklist checkbox toggle
  const toggleOrderItemCheck = useCallback(
    (orderId: string, orderItemId: string) => {
      let updatedCompleted = false;

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id !== orderId) return ord;
          const items = ord.items.map((item) => {
            if (item.id === orderItemId) {
              updatedCompleted = !item.completedInKitchen;
              return { ...item, completedInKitchen: updatedCompleted };
            }
            return item;
          });
          return { ...ord, items };
        })
      );

      broadcast({
        type: 'ITEM_CHECK_TOGGLED',
        payload: {
          orderId,
          orderItemId,
          completedInKitchen: updatedCompleted,
        },
        timestamp: Date.now(),
      });
    },
    [broadcast]
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      updateOrderStatus(orderId, 'cancelled');
    },
    [updateOrderStatus]
  );

  const setActiveOrderById = useCallback((orderId: string | null) => {
    setActiveOrderId(orderId);
    if (typeof window !== 'undefined') {
      if (orderId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ORDER, orderId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ORDER);
      }
    }
  }, []);

  // Menu Engineering: 86 / Out-of-Stock toggle
  const toggleItemAvailability = useCallback(
    (itemId: string) => {
      let nextAvailable = true;
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            nextAvailable = !item.isAvailable;
            return { ...item, isAvailable: nextAvailable };
          }
          return item;
        })
      );

      broadcast({
        type: 'MENU_ITEM_AVAILABILITY_TOGGLED',
        payload: {
          itemId,
          isAvailable: nextAvailable,
        },
        timestamp: Date.now(),
      });
    },
    [broadcast]
  );

  const toggleItemFeatured = useCallback(
    (itemId: string) => {
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const updated = { ...item, isFeatured: !item.isFeatured };
            broadcast({
              type: 'MENU_ITEM_UPDATED',
              payload: updated,
              timestamp: Date.now(),
            });
            return updated;
          }
          return item;
        })
      );
    },
    [broadcast]
  );

  const updateItemPrice = useCallback(
    (itemId: string, newPrice: number) => {
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const updated = { ...item, price: newPrice };
            broadcast({
              type: 'MENU_ITEM_UPDATED',
              payload: updated,
              timestamp: Date.now(),
            });
            return updated;
          }
          return item;
        })
      );
    },
    [broadcast]
  );

  const addMenuItem = useCallback(
    (itemData: Omit<MenuItem, 'id'>) => {
      const id = itemData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newItem: MenuItem = {
        ...itemData,
        id,
      };

      setMenuItems((prev) => [newItem, ...prev]);

      broadcast({
        type: 'MENU_ITEM_ADDED',
        payload: newItem,
        timestamp: Date.now(),
      });
    },
    [broadcast]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SOUND, String(next));
      }
      return next;
    });
  }, []);

  const resetToDemoDefaults = useCallback(() => {
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    setActiveOrderId(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(INITIAL_MENU_ITEMS));
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ORDER);
    }
    broadcast({
      type: 'RESET_DEMO_DATA',
      payload: {},
      timestamp: Date.now(),
    });
  }, [broadcast]);

  // Seed random order for instant demonstration
  const seedRandomOrder = useCallback(
    (tableOverride?: string) => {
      const sampleNames = ['Rohan Verma', 'Isha Singhania', 'Kabir Malhotra', 'Zoya Merchant', 'Devansh Patel'];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomTable = tableOverride || `Table 0${Math.floor(Math.random() * 9) + 1}`;
      const tokenNum = Math.floor(100 + Math.random() * 900);
      const orderId = `BS-${tokenNum}`;
      const now = new Date().toISOString();

      // Pick 2 random items
      const pick1 = menuItems[0];
      const pick2 = menuItems[12]; // Croissant or Bakehouse

      const newOrder: Order = {
        id: orderId,
        customerName: randomName,
        customerPhone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
        tableNumber: randomTable,
        items: [
          {
            id: `item-${orderId}-1`,
            menuItemId: pick1.id,
            name: pick1.name,
            category: pick1.category,
            station: pick1.station,
            quantity: 1,
            unitPrice: pick1.price + 60,
            totalPrice: pick1.price + 60,
            completedInKitchen: false,
            customization: {
              temperature: 'Hot 🔥',
              bean: { name: 'Ratnagiri Estate Honey', price: 40 },
              milk: { name: 'Barista Oat Milk', price: 60 },
              sweetness: { name: 'Barista Balanced (50%)', price: 0 },
              boosters: [{ name: 'Extra Shot', price: 50 }],
              specialNote: 'Extra warm & silky',
            },
          },
          {
            id: `item-${orderId}-2`,
            menuItemId: pick2.id,
            name: pick2.name,
            category: pick2.category,
            station: pick2.station,
            quantity: 1,
            unitPrice: pick2.price,
            totalPrice: pick2.price,
            completedInKitchen: false,
          },
        ],
        subtotal: pick1.price + 60 + pick2.price,
        tax: Math.round((pick1.price + 60 + pick2.price) * 0.05),
        total: Math.round((pick1.price + 60 + pick2.price) * 1.05),
        paymentMode: 'instant_upi',
        paymentStatus: 'paid',
        status: 'new',
        createdAt: now,
        updatedAt: now,
      };

      setOrders((prev) => [newOrder, ...prev]);

      if (soundEnabled) {
        playCafeOrderChime();
      }

      broadcast({
        type: 'ORDER_CREATED',
        payload: newOrder,
        timestamp: Date.now(),
      });

      return newOrder;
    },
    [menuItems, soundEnabled, broadcast]
  );

  return (
    <BrewStudioContext.Provider
      value={{
        menuItems,
        orders,
        cart,
        cartCount,
        cartSubtotal,
        soundEnabled,
        currentTable,
        activeOrder,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderStatus,
        verifyOrderPayment,
        toggleOrderItemCheck,
        cancelOrder,
        setActiveOrderById,
        toggleItemAvailability,
        toggleItemFeatured,
        updateItemPrice,
        addMenuItem,
        toggleSound,
        setCurrentTable,
        resetToDemoDefaults,
        seedRandomOrder,
        // Customer Profile & Onboarding
        customerName,
        customerPhone,
        orderType,
        deliveryAddress,
        isOnboarded,
        completeOnboarding,
        updateCustomerProfile,
        resetOnboarding,
      }}
    >
      {children}
    </BrewStudioContext.Provider>
  );
};

export const useBrewStudio = () => {
  const context = useContext(BrewStudioContext);
  if (!context) {
    throw new Error('useBrewStudio must be used within a BrewStudioProvider');
  }
  return context;
};
