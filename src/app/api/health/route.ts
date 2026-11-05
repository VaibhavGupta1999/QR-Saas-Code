import { NextResponse } from 'next/server';

export async function GET() {
  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-PROD',
    service: 'Hospitality OS / QR Menu SaaS',
    uptime: `${Math.floor(uptimeSeconds)}s`,
    environment: process.env.NODE_ENV || 'development',
    system: {
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
  });
}
