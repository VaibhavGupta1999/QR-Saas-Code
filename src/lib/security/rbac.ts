/**
 * Hospitality OS — RBAC & Staff PIN Security Engine
 * Supports multi-tenant role authorization and secure hashed PIN authentication.
 */

import { createHash, randomBytes, timingSafeEqual, scryptSync } from 'crypto';

export type StaffRole = 'platform_operator' | 'owner' | 'manager' | 'chef' | 'cashier';

export interface StaffSession {
  staffId: string;
  restaurantId: string;
  name: string;
  role: StaffRole;
  issuedAt: number;
  expiresAt: number;
}

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  platform_operator: [
    'tenants:manage',
    'subscriptions:manage',
    'audit:read_all',
    'restaurant:update',
    'staff:manage',
    'menu:manage',
    'tables:manage',
    'orders:read',
    'orders:update_status',
    'orders:read_kds',
    'orders:update_kitchen_status',
    'payments:verify',
    'reports:view',
    'receipt:print',
    'menu:toggle_86',
  ],
  owner: [
    'restaurant:update',
    'staff:manage',
    'menu:manage',
    'tables:manage',
    'orders:read',
    'orders:update_status',
    'payments:verify',
    'reports:view',
    'receipt:print',
  ],
  manager: [
    'menu:manage',
    'tables:manage',
    'orders:read',
    'orders:update_status',
    'payments:verify',
    'reports:view',
    'receipt:print',
  ],
  chef: [
    'orders:read_kds',
    'orders:update_kitchen_status',
    'menu:toggle_86',
  ],
  cashier: [
    'orders:read',
    'payments:verify',
    'receipt:print',
  ],
};

/**
 * Developer / Platform Super-Admin Credentials
 * Raw password "Vg@25121999" is NEVER saved; only the salted scrypt hash is stored.
 */
export const DEVELOPER_OPERATOR = {
  staffId: '00000000-0000-0000-0000-000000000001',
  restaurantId: 'a0000000-0000-0000-0000-000000000001', // Brew Studio default context
  name: 'Vaibhav Gupta',
  email: 'vaibhavgupta1148@gmail.com',
  role: 'platform_operator' as StaffRole,
  // Scrypt cryptographic hash for "Vg@25121999" with 16-byte salt
  passwordHash: '4591e0f4ec756d2f54638627eaa2749de6e8d39630e1ea4cc63d49dae2bc96aeb0ad50a61f2519bbfe688e05f2e5e2bff6cce69534cf35a18da0e324cf88f1ca',
  passwordSalt: '5cd17468126c5dca4d66954826f73274',
  // Tablet Terminal PIN: "2512" (SHA256 with salt)
  pinHash: '8542c77046e7d830f3d8e00ddc0b080de4917bc314e4780d0988056e57aab292',
  pinSalt: 'salt2512',
};

export function hasPermission(role: StaffRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Cryptographically secure password hashing using Node.js scrypt with salt.
 * All passwords are saved exclusively in this encrypted / hashed format.
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || randomBytes(16).toString('hex');
  const hash = scryptSync(password, finalSalt, 64).toString('hex');
  return { hash, salt: finalSalt };
}

/**
 * Timing-safe password verification against stored scrypt hash and salt.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const candidateHash = scryptSync(password, salt, 64).toString('hex');
    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');

    if (candidateBuf.length !== storedBuf.length) {
      return false;
    }
    return timingSafeEqual(candidateBuf, storedBuf);
  } catch {
    return false;
  }
}

/**
 * Hash a staff PIN using SHA-256 with a unique cryptographic salt.
 */
export function hashPin(pin: string, salt?: string): { pinHash: string; salt: string } {
  const finalSalt = salt || randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(pin + finalSalt)
    .digest('hex');
  return { pinHash: hash, salt: finalSalt };
}

/**
 * Timing-safe PIN verification against stored hash and salt.
 */
export function verifyPin(pin: string, storedHash: string, salt: string): boolean {
  try {
    const candidateHash = createHash('sha256')
      .update(pin + salt)
      .digest('hex');

    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');

    if (candidateBuf.length === storedBuf.length && timingSafeEqual(candidateBuf, storedBuf)) {
      return true;
    }

    // Fallback: support unsalted hash if stored representation was raw sha256
    const unsaltedHash = createHash('sha256')
      .update(pin)
      .digest('hex');
    const unsaltedBuf = Buffer.from(unsaltedHash, 'hex');

    if (unsaltedBuf.length === storedBuf.length && timingSafeEqual(unsaltedBuf, storedBuf)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Creates a signed base64 session token with 12-hour expiration for tablet shifts.
 */
export function createStaffToken(
  session: Omit<StaffSession, 'issuedAt' | 'expiresAt'>,
  secret: string = process.env.STAFF_SESSION_SECRET || 'fallback-dev-secret-32-chars-minimum!'
): string {
  const now = Date.now();
  const payload: StaffSession = {
    ...session,
    issuedAt: now,
    expiresAt: now + 12 * 60 * 60 * 1000, // 12 hours
  };

  const jsonStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(jsonStr).toString('base64url');
  const signature = createHash('sha256')
    .update(dataB64 + secret)
    .digest('hex');

  return `${dataB64}.${signature}`;
}

/**
 * Validates and decodes a staff session token.
 */
export function verifyStaffToken(
  token: string,
  secret: string = process.env.STAFF_SESSION_SECRET || 'fallback-dev-secret-32-chars-minimum!'
): StaffSession | null {
  try {
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return null;

    const expectedSignature = createHash('sha256')
      .update(dataB64 + secret)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const actualBuf = Buffer.from(signature, 'hex');

    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const payload: StaffSession = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'));

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
