import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, createAuthErrorResponse } from '@/lib/auth/getUserFromSession';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { LoyaltyTier } from '@prisma/client';

// Loyalty tier configuration
const LOYALTY_TIERS = {
  BRONZE: { min: 0, max: 999, nextTier: 'SILVER', benefits: ['Standard shipping', 'Basic customer support'] },
  SILVER: { min: 1000, max: 4999, nextTier: 'GOLD', benefits: ['Free standard shipping', 'Priority support', '5% birthday discount'] },
  GOLD: { min: 5000, max: 14999, nextTier: 'PLATINUM', benefits: ['Free express shipping', 'Dedicated support', '10% birthday discount', 'Early access to sales'] },
  PLATINUM: { min: 15000, max: 49999, nextTier: 'DIAMOND', benefits: ['Free overnight shipping', 'Personal shopper', '15% birthday discount', 'Exclusive events', 'Special member pricing'] },
  DIAMOND: { min: 50000, max: Infinity, nextTier: null, benefits: ['White-glove service', 'Custom pieces consultation', '20% birthday discount', 'VIP events', 'Lifetime warranty'] }
} as const;

function calculateLoyaltyTier(points: number): LoyaltyTier {
  if (points >= LOYALTY_TIERS.DIAMOND.min) return 'DIAMOND';
  if (points >= LOYALTY_TIERS.PLATINUM.min) return 'PLATINUM';
  if (points >= LOYALTY_TIERS.GOLD.min) return 'GOLD';
  if (points >= LOYALTY_TIERS.SILVER.min) return 'SILVER';
  return 'BRONZE';
}

function getPointsToNextTier(currentPoints: number, currentTier: LoyaltyTier): number | null {
  const tierConfig = LOYALTY_TIERS[currentTier];
  if (!tierConfig.nextTier) return null; // Already at highest tier
  
  const nextTierConfig = LOYALTY_TIERS[tierConfig.nextTier as keyof typeof LOYALTY_TIERS];
  return nextTierConfig.min - currentPoints;
}

// GET user loyalty program data
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;

    // Get current loyalty points from user profile
    const userProfile = dbUser.profile;
    const currentPoints = userProfile?.loyaltyPoints || 0;
    
    // Calculate current tier based on points
    const calculatedTier = calculateLoyaltyTier(currentPoints);
    
    // Update user's tier if it has changed
    if (userProfile && userProfile.loyaltyTier !== calculatedTier) {
      await prisma.userProfile.update({
        where: { userId: dbUser.id },
        data: { loyaltyTier: calculatedTier }
      });
    }

    const currentTier = calculatedTier;
    const tierConfig = LOYALTY_TIERS[currentTier];
    const pointsToNextTier = getPointsToNextTier(currentPoints, currentTier);

    // Get recent loyalty activity (if you have a loyalty activity table)
    // For now, we'll use order history as loyalty activity
    const recentOrders = await prisma.order.findMany({
      where: { 
        userId: dbUser.id,
        status: 'DELIVERED' // Only count completed orders for loyalty
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate loyalty activity from orders (assuming 1 point per rupee spent)
    const loyaltyActivity = recentOrders.map(order => ({
      id: order.id,
      type: 'EARNED' as const,
      points: Math.floor(Number(order.totalAmount)), // 1 point per rupee
      reason: `Order #${order.orderNumber}`,
      date: order.createdAt.toISOString(),
      orderId: order.id
    }));

    // Calculate some statistics
    const totalOrderValue = recentOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const averageOrderValue = recentOrders.length > 0 ? totalOrderValue / recentOrders.length : 0;

    return NextResponse.json({
      success: true,
      loyaltyProgram: {
        // Current status
        points: currentPoints,
        tier: currentTier,
        tierProgress: {
          current: currentTier,
          next: tierConfig.nextTier,
          pointsToNext: pointsToNextTier,
          progressPercentage: pointsToNextTier 
            ? Math.min(100, ((currentPoints - tierConfig.min) / (tierConfig.max - tierConfig.min)) * 100)
            : 100
        },
        
        // Benefits
        benefits: tierConfig.benefits,
        
        // Activity
        recentActivity: loyaltyActivity,
        
        // Statistics
        stats: {
          totalOrders: recentOrders.length,
          totalSpent: totalOrderValue,
          averageOrderValue: averageOrderValue,
          memberSince: dbUser.createdAt.toISOString()
        },
        
        // Tier information
        tiers: Object.entries(LOYALTY_TIERS).map(([tier, config]) => ({
          name: tier,
          minPoints: config.min,
          maxPoints: config.max === Infinity ? null : config.max,
          benefits: config.benefits,
          isActive: tier === currentTier
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching loyalty program data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch loyalty program data' 
      },
      { status: 500 }
    );
  }
}
