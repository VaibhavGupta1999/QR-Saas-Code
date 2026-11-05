import { NextRequest, NextResponse } from 'next/server';
import {
  DEVELOPER_OPERATOR,
  verifyPassword,
  createStaffToken,
} from '@/lib/security/rbac';

// Rate limiting map for developer login (Max 5 failed attempts per 15 mins)
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitKey = `dev:${normalizedEmail}`;

    // Rate Limiting Check
    const rateLimit = failedAttemptsMap.get(rateLimitKey);
    if (rateLimit && rateLimit.lockedUntil > Date.now()) {
      const waitSeconds = Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Account temporarily locked for ${waitSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Verify developer email match
    if (normalizedEmail !== DEVELOPER_OPERATOR.email.toLowerCase()) {
      recordFailure(rateLimitKey);
      return NextResponse.json(
        { success: false, error: 'Invalid developer credentials.' },
        { status: 401 }
      );
    }

    // Verify encrypted scrypt password hash with timing-safe comparison
    const isValid = verifyPassword(
      password,
      DEVELOPER_OPERATOR.passwordHash,
      DEVELOPER_OPERATOR.passwordSalt
    );

    if (!isValid) {
      recordFailure(rateLimitKey);
      return NextResponse.json(
        { success: false, error: 'Invalid developer credentials.' },
        { status: 401 }
      );
    }

    // Clear failed attempts on success
    failedAttemptsMap.delete(rateLimitKey);

    // Issue signed 12-hour session token
    const token = createStaffToken({
      staffId: DEVELOPER_OPERATOR.staffId,
      restaurantId: DEVELOPER_OPERATOR.restaurantId,
      name: DEVELOPER_OPERATOR.name,
      role: DEVELOPER_OPERATOR.role,
    });

    return NextResponse.json({
      success: true,
      token,
      developer: {
        id: DEVELOPER_OPERATOR.staffId,
        name: DEVELOPER_OPERATOR.name,
        email: DEVELOPER_OPERATOR.email,
        role: DEVELOPER_OPERATOR.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

function recordFailure(key: string) {
  const current = failedAttemptsMap.get(key) || { count: 0, lockedUntil: 0 };
  const newCount = current.count + 1;
  const lockedUntil = newCount >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
  failedAttemptsMap.set(key, { count: newCount, lockedUntil });
}
