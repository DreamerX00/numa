import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { id } = await params;
    const { message, isInternal = false, attachments = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get admin user ID from the session
    // Note: We need to get the actual admin user from the database
    const adminUser = await prisma.user.findFirst({
      where: { 
        role: 'ADMIN',
        isActive: true 
      }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 400 }
      );
    }

    // Create response
    const response = await prisma.supportTicketResponse.create({
      data: {
        ticketId: id,
        userId: adminUser.id,
        message,
        isInternal,
        attachments
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: id },
      select: { status: true }
    });

    if (ticket?.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id: id },
        data: { 
          status: 'IN_PROGRESS',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      response,
      message: 'Response added successfully'
    });

  } catch (error) {
    console.error('Support response creation error:', error);
    return NextResponse.json(
      { error: 'Failed to add response' },
      { status: 500 }
    );
  }
}