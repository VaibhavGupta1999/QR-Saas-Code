import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, createStaffToken, StaffRole, DEVELOPER_OPERATOR } from '@/lib/security/rbac';

// Seed staff directory for development & quick tablet authentication
// Salted PIN "1234" with salt "salt123": SHA256("1234salt123") = "036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc"
const SEED_STAFF = [
  // Developer & Platform Operator Accounts
  {
    id: DEVELOPER_OPERATOR.staffId,
    restaurantId: DEVELOPER_OPERATOR.restaurantId,
    name: `${DEVELOPER_OPERATOR.name} (Developer / Operator)`,
    role: 'platform_operator' as StaffRole,
    pinHash: DEVELOPER_OPERATOR.pinHash, // "2512"
    pinSalt: DEVELOPER_OPERATOR.pinSalt,
    isActive: true,
  },
  {
    id: DEVELOPER_OPERATOR.staffId,
    restaurantId: DEVELOPER_OPERATOR.restaurantId,
    name: `${DEVELOPER_OPERATOR.name} (Developer / Operator)`,
    role: 'platform_operator' as StaffRole,
    pinHash: '85f6c0938cc89bb4b91978e0aa6fcad57c1bc1d6febeb39339e364e3e92800ae', // "1999" (from Vg@25121999)
    pinSalt: 'salt1999',
    isActive: true,
  },
  {
    id: DEVELOPER_OPERATOR.staffId,
    restaurantId: DEVELOPER_OPERATOR.restaurantId,
    name: `${DEVELOPER_OPERATOR.name} (Developer / Operator)`,
    role: 'platform_operator' as StaffRole,
    pinHash: 'a9764c2ae87379c1d1805a23296522bcb8b510a66d6b7e16268fdf068e94b759', // "1148" (from Vaibhavgupta1148)
    pinSalt: 'salt1148',
    isActive: true,
  },
  // Restaurant Staff Accounts (PIN: 1234)
  {
    id: 's0000000-0000-0000-0000-000000000001',
    restaurantId: 'a0000000-0000-0000-0000-000000000001',
    name: 'Vikram Malhotra',
    role: 'owner' as StaffRole,
    pinHash: '036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc', // "1234"
    pinSalt: 'salt123',
    isActive: true,
  },
  {
    id: 's0000000-0000-0000-0000-000000000002',
    restaurantId: 'a0000000-0000-0000-0000-000000000001',
    name: 'Suresh (Head Barista / KDS)',
    role: 'chef' as StaffRole,
    pinHash: '036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc', // "1234"
    pinSalt: 'salt123',
    isActive: true,
  },
  {
    id: 's0000000-0000-0000-0000-000000000003',
    restaurantId: 'a0000000-0000-0000-0000-000000000001',
    name: 'Priya (Cashier)',
    role: 'cashier' as StaffRole,
    pinHash: '036746422028a426e3d7ed949b42915ab60dcd7186c64bb2133e4052ea0b9cdc', // "1234"
    pinSalt: 'salt123',
    isActive: true,
  },
];

// In-memory rate limiting map for PIN attempts (auto-cleared)
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, pin, role } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid 4-digit PIN is required.' },
        { status: 400 }
      );
    }

    const restId = restaurantId || 'a0000000-0000-0000-0000-000000000001';
    const rateLimitKey = `${restId}:${pin}`;

    // Rate Limiting Check (Max 5 failed attempts per 15 mins)
    const rateLimit = failedAttemptsMap.get(rateLimitKey);
    if (rateLimit && rateLimit.lockedUntil > Date.now()) {
      const waitSeconds = Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Terminal locked for ${waitSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Find staff member matching restaurant and optional requested role (platform_operator has universal access)
    const candidates = SEED_STAFF.filter(
      (s) =>
        s.isActive &&
        (s.role === 'platform_operator' || s.restaurantId === restId) &&
        (!role || s.role === role || s.role === 'platform_operator')
    );

    let matchedStaff: (typeof SEED_STAFF)[0] | null = null;
    for (const candidate of candidates) {
      if (verifyPin(pin, candidate.pinHash, candidate.pinSalt)) {
        matchedStaff = candidate;
        break;
      }
    }

    if (!matchedStaff) {
      const current = failedAttemptsMap.get(rateLimitKey) || { count: 0, lockedUntil: 0 };
      const newCount = current.count + 1;
      const lockedUntil = newCount >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
      failedAttemptsMap.set(rateLimitKey, { count: newCount, lockedUntil });

      return NextResponse.json(
        { success: false, error: 'Invalid PIN or unauthorized role for this terminal.' },
        { status: 401 }
      );
    }

    // Reset rate limiter on success
    failedAttemptsMap.delete(rateLimitKey);

    const token = createStaffToken({
      staffId: matchedStaff.id,
      restaurantId: matchedStaff.restaurantId,
      name: matchedStaff.name,
      role: matchedStaff.role,
    });

    return NextResponse.json({
      success: true,
      token,
      staff: {
        id: matchedStaff.id,
        name: matchedStaff.name,
        role: matchedStaff.role,
        restaurantId: matchedStaff.restaurantId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
