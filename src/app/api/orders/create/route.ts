import { NextRequest, NextResponse } from 'next/server';
import { createValidatedOrder } from '@/lib/orders/orderService';
import { getTenantCatalog } from '@/lib/catalog/tenantCatalog';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const restaurantId = body.restaurantId || 'a0000000-0000-0000-0000-000000000001';
    const catalog = getTenantCatalog(restaurantId);

    if (!catalog) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found or inactive.' },
        { status: 404 }
      );
    }

    const { order, isDuplicateRetry } = await createValidatedOrder(
      { ...body, restaurantId },
      catalog
    );

    return NextResponse.json(
      {
        success: true,
        order,
        isDuplicateRetry,
        message: isDuplicateRetry
          ? 'Existing order returned (idempotency key matched).'
          : 'Order validated and created successfully.',
      },
      { status: isDuplicateRetry ? 200 : 201 }
    );
  } catch (error: any) {
    logger.error('Order creation failed on server validation', { error: error.message });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create order due to server validation error.',
      },
      { status: 400 }
    );
  }
}
