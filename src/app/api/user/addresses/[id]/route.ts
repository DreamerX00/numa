import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/session';
import { z } from 'zod';

const addressUpdateSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
  isDefault: z.boolean().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  company: z.string().optional(),
  address1: z.string().min(1).optional(),
  address2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().optional(),
  phone: z.string().optional()
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = addressUpdateSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: id,
        userId: dbUser.id 
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults of the same type
    if (validatedData.isDefault && validatedData.type) {
      await prisma.address.updateMany({
        where: { 
          userId: dbUser.id,
          type: validatedData.type,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: id },
      data: validatedData
    });

    return NextResponse.json({
      message: 'Address updated successfully',
      address: updatedAddress
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: id,
        userId: dbUser.id 
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: id }
    });

    return NextResponse.json({
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}