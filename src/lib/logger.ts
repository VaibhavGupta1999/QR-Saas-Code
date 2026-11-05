/**
 * Hospitality OS — Structured Production Logger
 * Provides JSON logging with correlation IDs and sensitive data redaction.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  correlationId?: string;
  tenantId?: string;
  staffId?: string;
  role?: string;
  path?: string;
  [key: string]: any;
}

const REDACTED_KEYS = new Set([
  'password',
  'pin',
  'pin_hash',
  'authorization',
  'cookie',
  'secret',
  'token',
  'key',
]);

function redactSensitive(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitive);
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactSensitive(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export function createLogger(defaultContext: LogContext = {}) {
  const log = (level: LogLevel, message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    const mergedContext = redactSensitive({ ...defaultContext, ...context });

    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...mergedContext,
    };

    const formatted = JSON.stringify(logEntry);

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  };

  return {
    debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
    info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
    warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
    error: (msg: string, ctx?: LogContext) => log('error', msg, ctx),
  };
}

export const logger = createLogger();
