import { NextRequest, NextResponse } from 'next/server';
import { transitionOrderStatus, OrderStatus } from '@/lib/orders/statusService';
import { verifyStaffToken } from '@/lib/security/rbac';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Staff session token required.' },
        { status: 401 }
      );
    }

    const session = verifyStaffToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired staff session.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'orderId and target status are required.' },
        { status: 400 }
      );
    }

    const updatedOrder = await transitionOrderStatus(orderId, status as OrderStatus, session);

    return NextResponse.json({
      success: true,
      message: `Order #${updatedOrder.orderToken} transitioned to "${status}".`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Forbidden') ? 403 : 400 }
    );
  }
}
