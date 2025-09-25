import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, verifyAdminAuth } from '@/lib/auth/admin';
import { z } from 'zod';

const createNoteSchema = z.object({
  note: z.string().min(1),
  isInternal: z.boolean().default(true)
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const orderId = id;

    const notes = await prisma.orderNote.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ notes });

  } catch (error) {
    console.error('Get order notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order notes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  // Get admin email for audit trail
  const authResult = await verifyAdminAuth(request);
  const adminEmail = authResult.success ? authResult.firebaseUser?.email : null;

  try {
    const orderId = id;
    const body = await request.json();
    const data = createNoteSchema.parse(body);

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create note
    const note = await prisma.orderNote.create({
      data: {
        orderId,
        note: data.note,
        isInternal: data.isInternal,
        authorName: adminEmail || 'System'
      }
    });

    return NextResponse.json(note, { status: 201 });

  } catch (error) {
    console.error('Create order note error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order note' },
      { status: 500 }
    );
  }
}