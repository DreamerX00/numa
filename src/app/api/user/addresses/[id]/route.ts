import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, createAuthErrorResponse } from '@/lib/auth/getUserFromSession';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Address validation schema - matches actual Prisma schema
const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  company: z.string().max(100).optional(),
  address1: z.string().min(1).max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100).default('IN'),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional()
});

// GET specific address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Fetch specific address
    const address = await prisma.address.findUnique({
      where: { 
        id: id,
        userId: dbUser.id // Ensure user owns the address
      }
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Transform address for response
    const transformedAddress = {
      id: address.id,
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      address: transformedAddress
    });

  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch address' 
      },
      { status: 500 }
    );
  }
}

// PUT update specific address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = addressSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid address data',
          validationErrors: validationResult.error.issues.reduce((acc, issue) => {
            const key = issue.path[0]?.toString() || 'unknown';
            acc[key] = issue.message;
            return acc;
          }, {} as Record<string, string>)
        },
        { status: 400 }
      );
    }

    const addressData = validationResult.data;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: id },
      select: { userId: true, type: true }
    });

    if (!existingAddress || existingAddress.userId !== dbUser.id) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // If this address is set as default, unset other defaults of the same type
    if (addressData.isDefault && addressData.type) {
      await prisma.address.updateMany({
        where: { 
          userId: dbUser.id,
          type: addressData.type,
          id: { not: id } // Exclude current address
        },
        data: { isDefault: false }
      });
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: id },
      data: {
        type: addressData.type || existingAddress.type,
        firstName: addressData.firstName,
        lastName: addressData.lastName,
        company: addressData.company || null,
        address1: addressData.address1,
        address2: addressData.address2 || null,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country || 'IN',
        phone: addressData.phone || null,
        isDefault: addressData.isDefault || false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      address: {
        id: updatedAddress.id,
        type: updatedAddress.type,
        firstName: updatedAddress.firstName,
        lastName: updatedAddress.lastName,
        company: updatedAddress.company || '',
        address1: updatedAddress.address1,
        address2: updatedAddress.address2 || '',
        city: updatedAddress.city,
        state: updatedAddress.state,
        postalCode: updatedAddress.postalCode,
        country: updatedAddress.country,
        phone: updatedAddress.phone || '',
        isDefault: updatedAddress.isDefault,
        createdAt: updatedAddress.createdAt.toISOString(),
        updatedAt: updatedAddress.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update address' 
      },
      { status: 500 }
    );
  }
}

// DELETE specific address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Check if address belongs to user and if it's used in any orders
    const addressCheck = await prisma.address.findUnique({
      where: { id: id },
      include: {
        orders: true,
        billingOrders: true
      }
    });

    if (!addressCheck || addressCheck.userId !== dbUser.id) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Check if address is used in any orders
    const isUsedInOrders = addressCheck.orders.length > 0 || addressCheck.billingOrders.length > 0;
    
    if (isUsedInOrders) {
      // Soft delete (mark as inactive) instead of hard delete
      await prisma.address.update({
        where: { id: id },
        data: { 
          isActive: false,
          isDefault: false // Remove default status when soft deleting
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Address has been removed from your address list',
        softDeleted: true
      });
    }

    // Hard delete address (not used in orders)
    await prisma.address.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete address' 
      },
      { status: 500 }
    );
  }
}