import { NextRequest, NextResponse } from 'next/server';
import { registerTenant, TenantData } from '@/lib/catalog/tenantCatalog';

// Global state for operator managed tenants
const tenantsList: Array<TenantData['restaurant']> = [
  {
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
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    slug: 'blue-tokai',
    name: 'Blue Tokai Coffee Roasters',
    taxRate: 5.0,
    isActive: true,
    subscriptionStatus: 'active',
    subscriptionExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    upiVpa: 'bluetokai@icici',
    address: 'Connaught Place, New Delhi - 110001',
    phone: '+91 98111 22233',
    gstin: '07AABCU1111R1ZM',
    fssai: '22334455667788',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: tenantsList.length,
    tenants: tenantsList,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, upiVpa, address, phone, gstin, fssai, taxRate = 5.0 } = body;

    if (!name || !slug || !upiVpa || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, upiVpa and phone are required.' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existing = tenantsList.find((t) => t.slug === cleanSlug);
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Tenant slug "${cleanSlug}" is already registered.` },
        { status: 409 }
      );
    }

    const newTenant = {
      id: `rest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      slug: cleanSlug,
      name,
      taxRate: Number(taxRate) || 5.0,
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      upiVpa,
      address: address || '',
      phone,
      gstin,
      fssai,
    };

    tenantsList.unshift(newTenant);

    // Register into catalog
    registerTenant({
      restaurant: newTenant,
      menuItems: [],
      modifiers: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: `Tenant "${name}" onboarded successfully.`,
        tenant: newTenant,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, action } = body;

    const tenant = tenantsList.find((t) => t.id === tenantId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found.' },
        { status: 404 }
      );
    }

    if (action === 'suspend') {
      tenant.subscriptionStatus = 'suspended';
      tenant.isActive = false;
    } else if (action === 'activate') {
      tenant.subscriptionStatus = 'active';
      tenant.isActive = true;
    } else if (action === 'renew') {
      tenant.subscriptionStatus = 'active';
      tenant.isActive = true;
      tenant.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    return NextResponse.json({
      success: true,
      message: `Tenant "${tenant.name}" updated to status "${tenant.subscriptionStatus}".`,
      tenant,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
