import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { SupportTicketStatus, SupportTicketPriority, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SupportTicketWhereInput = {};
    
    if (status !== 'all') {
      where.status = status as SupportTicketStatus;
    }
    
    if (priority !== 'all') {
      where.priority = priority as SupportTicketPriority;
    }
    
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get tickets with user information
    const tickets = await prisma.supportTicket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalTickets = await prisma.supportTicket.count({ where });

    // Get statistics
    const [
      openTickets,
      resolvedToday
    ] = await Promise.all([
      // Count of open tickets
      prisma.supportTicket.count({ 
        where: { status: 'OPEN' } 
      }),
      
      // Count of tickets resolved today
      prisma.supportTicket.count({
        where: {
          status: 'RESOLVED',
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        totalCount: totalTickets,
        totalPages: Math.ceil(totalTickets / limit)
      },
      stats: {
        totalTickets,
        openTickets,
        resolvedToday,
        avgResponseTime: 2.5 // Placeholder for now
      }
    });

  } catch (error) {
    console.error('Support tickets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { 
      userId, 
      subject, 
      description, 
      priority = 'MEDIUM',
      tags = [] 
    } = await request.json();

    if (!userId || !subject || !description) {
      return NextResponse.json(
        { error: 'User ID, subject, and description are required' },
        { status: 400 }
      );
    }

    // Generate ticket number
    const ticketCount = await prisma.supportTicket.count();
    const ticketNumber = `NUMA-${String(ticketCount + 1).padStart(6, '0')}`;

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject,
        description,
        priority: priority as SupportTicketPriority,
        tags,
        status: 'OPEN'
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    return NextResponse.json({
      ticket,
      message: 'Support ticket created successfully'
    });

  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}