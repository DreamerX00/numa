import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { SupportTicketStatus, SupportTicketPriority, Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: id },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        assignedTo: {
          include: {
            profile: true
          }
        },
        responses: {
          orderBy: { createdAt: 'asc' },
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

    if (!ticket) {
      return NextResponse.json(
        { error: 'Support ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket });

  } catch (error) {
    console.error('Support ticket fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { 
      status, 
      priority, 
      assignedToId, 
      tags 
    } = await request.json();

    const updateData: Prisma.SupportTicketUpdateInput = {};

    if (status) {
      updateData.status = status as SupportTicketStatus;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      } else if (status === 'CLOSED') {
        updateData.closedAt = new Date();
        if (!updateData.resolvedAt) {
          updateData.resolvedAt = new Date();
        }
      }
    }

    if (priority) {
      updateData.priority = priority as SupportTicketPriority;
    }

    if (assignedToId !== undefined) {
      if (assignedToId) {
        updateData.assignedTo = { connect: { id: assignedToId } };
      } else {
        updateData.assignedTo = { disconnect: true };
      }
    }

    if (tags) {
      updateData.tags = tags;
    }

    updateData.updatedAt = new Date();

    const ticket = await prisma.supportTicket.update({
      where: { id: id },
      data: updateData,
      include: {
        user: {
          include: {
            profile: true
          }
        },
        assignedTo: {
          include: {
            profile: true
          }
        }
      }
    });

    return NextResponse.json({
      ticket,
      message: 'Support ticket updated successfully'
    });

  } catch (error) {
    console.error('Support ticket update error:', error);
    return NextResponse.json(
      { error: 'Failed to update support ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    await prisma.supportTicket.delete({
      where: { id: id }
    });

    return NextResponse.json({
      message: 'Support ticket deleted successfully'
    });

  } catch (error) {
    console.error('Support ticket deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete support ticket' },
      { status: 500 }
    );
  }
}