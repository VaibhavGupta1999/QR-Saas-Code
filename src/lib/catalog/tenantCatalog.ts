/**
 * Hospitality OS — Tenant Catalog Loader
 * Resolves restaurant metadata, active menu items, and modifiers for order validation.
 */

import { INITIAL_MENU_ITEMS } from '@/data/initialMenu';

export interface TenantData {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    taxRate: number;
    isActive: boolean;
    subscriptionStatus: string;
    subscriptionExpiresAt: string;
    upiVpa: string;
    address: string;
    phone: string;
    gstin?: string;
    fssai?: string;
  };
  menuItems: Array<{
    id: string;
    name: string;
    price: number;
    station: 'barista' | 'kitchen';
    isAvailable: boolean;
    allowsCustomization?: boolean;
  }>;
  modifiers: Array<{
    type: string;
    name: string;
    extraPrice: number;
    isAvailable: boolean;
  }>;
}

// Default Seed Catalog (Brew Studio India)
const BREW_STUDIO_TENANT: TenantData = {
  restaurant: {
    id: 'a0000000-0000-0000-0000-000000000001',
    slug: 'brew-studio',
    name: 'Brew Studio India',
    taxRate: 5.0,
    isActive: true,
    subscriptionStatus: 'active',
    subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    upiVpa: 'brewstudio@okhdfcbank',
    address: '100ft Rd, Indiranagar, Bengaluru - 560038',
    phone: '+91 98765 43210',
    gstin: '29AABCU9603R1ZM',
    fssai: '11223344556677',
  },
  menuItems: INITIAL_MENU_ITEMS.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    station: item.station,
    isAvailable: item.isAvailable,
    allowsCustomization: item.allowsCustomization,
  })),
  modifiers: [
    { type: 'bean', name: 'Estate Blend (Medium-Dark)', extraPrice: 0, isAvailable: true },
    { type: 'bean', name: 'Riverdale Anaerobic (+₹60)', extraPrice: 60, isAvailable: true },
    { type: 'bean', name: 'Kerehaklu Natural (+₹50)', extraPrice: 50, isAvailable: true },
    { type: 'milk', name: 'Whole Dairy Milk', extraPrice: 0, isAvailable: true },
    { type: 'milk', name: 'Oat Milk (+₹45)', extraPrice: 45, isAvailable: true },
    { type: 'milk', name: 'Almond Milk (+₹55)', extraPrice: 55, isAvailable: true },
    { type: 'sweetness', name: 'Unsweetened (Zero Sugar)', extraPrice: 0, isAvailable: true },
    { type: 'sweetness', name: 'Raw Honey (+₹25)', extraPrice: 25, isAvailable: true },
    { type: 'booster', name: 'Single Origin Espresso Shot', extraPrice: 45, isAvailable: true },
    { type: 'booster', name: 'Madagascar Vanilla Pod Infusion', extraPrice: 35, isAvailable: true },
  ],
};

const tenantRegistry = new Map<string, TenantData>();
tenantRegistry.set(BREW_STUDIO_TENANT.restaurant.id, BREW_STUDIO_TENANT);
tenantRegistry.set(BREW_STUDIO_TENANT.restaurant.slug, BREW_STUDIO_TENANT);

export function getTenantCatalog(restaurantIdOrSlug: string): TenantData | null {
  return tenantRegistry.get(restaurantIdOrSlug) || null;
}

export function registerTenant(tenant: TenantData) {
  tenantRegistry.set(tenant.restaurant.id, tenant);
  tenantRegistry.set(tenant.restaurant.slug, tenant);
}
