import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';
import { z } from 'zod';
import { ReturnStatus } from '@prisma/client';

const updateReturnSchema = z.object({
  status: z.nativeEnum(ReturnStatus).optional(),
  adminNotes: z.string().optional(),
  refundAmount: z.number().optional(),
  shippingRefund: z.number().optional(),
  restockingFee: z.number().optional(),
  returnTrackingNumber: z.string().optional(),
  returnCarrier: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const returnRecord = await prisma.return.findUnique({
      where: { id: id },
      include: {
        order: {
          include: {
            user: {
              include: {
                profile: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: true,
                    sku: true
                  }
                }
              }
            },
            shippingAddress: true,
            billingAddress: true
          }
        }
      }
    });

    if (!returnRecord) {
      return NextResponse.json(
        { error: 'Return not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(returnRecord);

  } catch (error) {
    console.error('Get return error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const data = updateReturnSchema.parse(body);

    // Get current return
    const currentReturn = await prisma.return.findUnique({
      where: { id: id },
      include: {
        order: {
          include: {
            user: true
          }
        }
      }
    });

    if (!currentReturn) {
      return NextResponse.json(
        { error: 'Return not found' },
        { status: 404 }
      );
    }

    // Prepare update data with timestamps
    const updateData: Record<string, unknown> = { ...data };
    
    // Set timestamps based on status changes
    if (data.status && data.status !== currentReturn.status) {
      const now = new Date();
      
      switch (data.status) {
        case 'APPROVED':
          updateData.approvedAt = now;
          break;
        case 'RECEIVED':
          updateData.receivedAt = now;
          break;
        case 'PROCESSED':
          updateData.processedAt = now;
          break;
        case 'COMPLETED':
          updateData.completedAt = now;
          break;
      }
    }

    // Update return record
    const updatedReturn = await prisma.return.update({
      where: { id: id },
      data: updateData,
      include: {
        order: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    // If return is completed and refund amount is set, update order payment status
    if (data.status === 'COMPLETED' && data.refundAmount) {
      await prisma.order.update({
        where: { id: currentReturn.orderId },
        data: {
          paymentStatus: data.refundAmount >= currentReturn.order.totalAmount 
            ? 'REFUNDED' 
            : 'PARTIALLY_REFUNDED'
        }
      });
    }

    // TODO: Send notification to customer about status change

    return NextResponse.json(updatedReturn);

  } catch (error) {
    console.error('Update return error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update return' },
      { status: 500 }
    );
  }
}