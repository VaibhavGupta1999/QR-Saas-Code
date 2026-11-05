import { NextRequest, NextResponse } from 'next/server';
import { verifyOrderPayment } from '@/lib/orders/paymentService';
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
    const { orderId, amount, paymentMode, transactionReference, notes } = body;

    if (!orderId || typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'orderId and numerical amount are required.' },
        { status: 400 }
      );
    }

    const result = await verifyOrderPayment(orderId, session, {
      amount,
      paymentMode: paymentMode || 'instant_upi',
      transactionReference,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Order #${result.order.orderToken} payment verified and recorded.`,
      order: result.order,
      payment: result.payment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Forbidden') ? 403 : 400 }
    );
  }
}
