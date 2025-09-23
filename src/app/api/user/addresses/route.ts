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
  isDefault: z.boolean().optional()
});

// GET user addresses
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;

    // Fetch user addresses
    const addresses = await prisma.address.findMany({
      where: { userId: dbUser.id },
      orderBy: [
        { isDefault: 'desc' }, // Default addresses first
        { createdAt: 'desc' }
      ]
    });

    // Transform addresses for response
    const transformedAddresses = addresses.map(address => ({
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
    }));

    return NextResponse.json({
      success: true,
      addresses: transformedAddresses
    });

  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch addresses' 
      },
      { status: 500 }
    );
  }
}

// POST create new address
export async function POST(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const body = await request.json();

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

    // If this address is set as default, unset other defaults of the same type
    if (addressData.isDefault && addressData.type) {
      await prisma.address.updateMany({
        where: { 
          userId: dbUser.id,
          type: addressData.type 
        },
        data: { isDefault: false }
      });
    }

    // Create new address
    const newAddress = await prisma.address.create({
      data: {
        userId: dbUser.id,
        type: addressData.type || 'SHIPPING',
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
      message: 'Address created successfully',
      address: {
        id: newAddress.id,
        type: newAddress.type,
        firstName: newAddress.firstName,
        lastName: newAddress.lastName,
        company: newAddress.company || '',
        address1: newAddress.address1,
        address2: newAddress.address2 || '',
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
        phone: newAddress.phone || '',
        isDefault: newAddress.isDefault,
        createdAt: newAddress.createdAt.toISOString(),
        updatedAt: newAddress.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create address' 
      },
      { status: 500 }
    );
  }
}

// PUT update address
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const body = await request.json();
    const addressId = body.id;

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Validate request body (excluding id)
    const addressBody = Object.fromEntries(
      Object.entries(body).filter(([key]) => key !== 'id')
    );
    const validationResult = addressSchema.safeParse(addressBody);
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
      where: { id: addressId },
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
          id: { not: addressId } // Exclude current address
        },
        data: { isDefault: false }
      });
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
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

// DELETE remove address
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Check if address belongs to user and if it's used in any orders
    const addressCheck = await prisma.address.findUnique({
      where: { id: addressId },
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete address that has been used in orders. You can mark it as inactive instead.' 
        },
        { status: 400 }
      );
    }

    // Delete address
    await prisma.address.delete({
      where: { id: addressId }
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