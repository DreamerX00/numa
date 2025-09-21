import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface ProductWithShipping {
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    weight?: number | null;
    shippingLength?: number | null;
    shippingWidth?: number | null;
    shippingHeight?: number | null;
    shippingClass?: string;
    price: number;
    individualShippingRate?: number | null;
    variants: Array<{
      id: string;
      price: number | null;
    }>;
  };
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass: string;
  individualShippingRate?: number | null;
  price: number;
}

const calculateShippingSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().int().positive()
  })),
  address: z.object({
    postalCode: z.string().min(1),
    state: z.string().min(1),
    country: z.string().default('IN')
  }).optional()
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log('Raw body received:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: String(parseError) },
        { status: 400 }
      );
    }
    
    console.log('Shipping API received:', JSON.stringify(body, null, 2));
    const { items, address } = calculateShippingSchema.parse(body);

    // Fetch product details for shipping calculation
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { variants: true }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        let weight = product.weight || 0;
        const dimensions = {
          length: product.shippingLength || 0,
          width: product.shippingWidth || 0,
          height: product.shippingHeight || 0
        };
        const shippingClass = product.shippingClass || 'standard';
        
        // Get individual shipping rate if set
        const individualShippingRate = product.individualShippingRate;

        if (item.variantId) {
          const variant = product.variants.find(v => v.id === item.variantId);
          if (variant) {
            // Variants don't have weight/dimensions in this schema, use product values
            weight = product.weight || weight;
          }
        }

        return {
          ...item,
          product,
          weight: weight * item.quantity,
          dimensions,
          shippingClass,
          individualShippingRate, // Include individual shipping rate
          price: item.variantId 
            ? product.variants.find(v => v.id === item.variantId)?.price || product.price
            : product.price
        };
      })
    );

    // Calculate totals
    const subtotal = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWeight = products.reduce((sum, item) => sum + item.weight, 0);

    // Determine if free shipping applies
    const freeShippingThreshold = 500; // ₹500
    const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

    if (qualifiesForFreeShipping) {
      return NextResponse.json({
        shipping: {
          cost: 0,
          method: 'FREE',
          estimatedDays: '3-5',
          qualifiesForFreeShipping: true,
          freeShippingThreshold
        },
        breakdown: {
          subtotal,
          totalWeight,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        }
      });
    }

    // Check if any products have individual shipping rates and prioritize them
    const hasIndividualRates = products.some(item => item.individualShippingRate !== null && item.individualShippingRate !== undefined);
    
    let shippingCost: number;
    if (hasIndividualRates) {
      // Use individual shipping rates when available
      shippingCost = products.reduce((total, item) => {
        if (item.individualShippingRate !== null && item.individualShippingRate !== undefined) {
          return total + (item.individualShippingRate * item.quantity);
        }
        // Fallback to a base rate for items without individual rates
        return total + 50; // Default base rate
      }, 0);
    } else {
      // Calculate shipping based on weight and shipping classes
      shippingCost = calculateShippingCost(totalWeight, products, address);
    }

    // Apply shipping class modifiers
    const hasExpressItems = products.some(item => item.shippingClass === 'EXPRESS');
    const hasFragileItems = products.some(item => item.shippingClass === 'FRAGILE');

    if (hasExpressItems) {
      shippingCost += 20; // Express handling fee
    }

    if (hasFragileItems) {
      shippingCost += 15; // Fragile handling fee
    }

    // Determine delivery time
    let estimatedDays = '3-5';
    if (hasExpressItems) {
      estimatedDays = '1-2';
    } else if (address?.state && isMetroCity(address.state)) {
      estimatedDays = '2-4';
    }

    return NextResponse.json({
      shipping: {
        cost: Math.round(shippingCost),
        method: hasExpressItems ? 'EXPRESS' : 'STANDARD',
        estimatedDays,
        qualifiesForFreeShipping: false,
        freeShippingThreshold,
        amountForFreeShipping: Math.max(0, freeShippingThreshold - subtotal)
      },
      breakdown: {
        subtotal,
        totalWeight,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        baseShipping: hasIndividualRates ? shippingCost - (hasExpressItems ? 20 : 0) - (hasFragileItems ? 15 : 0) : calculateShippingCost(totalWeight, products, address),
        expressFee: hasExpressItems ? 20 : 0,
        fragileFee: hasFragileItems ? 15 : 0,
        individualRatesUsed: hasIndividualRates
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}

function calculateShippingCost(
  totalWeight: number, 
  products: ProductWithShipping[], 
  address?: { postalCode: string; state: string; country: string }
): number {
  // Base shipping rates by weight
  let baseCost = 0;
  
  if (totalWeight <= 0.5) {
    baseCost = 40;
  } else if (totalWeight <= 1) {
    baseCost = 50;
  } else if (totalWeight <= 2) {
    baseCost = 60;
  } else if (totalWeight <= 5) {
    baseCost = 80;
  } else if (totalWeight <= 10) {
    baseCost = 100;
  } else {
    baseCost = 120;
  }

  // Apply regional multipliers
  if (address?.state) {
    if (isMetroCity(address.state)) {
      baseCost *= 1.0; // No extra cost for metro cities
    } else if (isRemoteArea(address.state)) {
      baseCost *= 1.5; // 50% extra for remote areas
    } else {
      baseCost *= 1.2; // 20% extra for other areas
    }
  }

  return baseCost;
}

function isMetroCity(state: string): boolean {
  const metroCities = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 
    'West Bengal', 'Gujarat', 'Telangana', 'Haryana'
  ];
  return metroCities.includes(state);
}

function isRemoteArea(state: string): boolean {
  const remoteAreas = [
    'Jammu and Kashmir', 'Ladakh', 'Himachal Pradesh', 
    'Uttarakhand', 'Arunachal Pradesh', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 
    'Sikkim', 'Andaman and Nicobar Islands', 'Lakshadweep'
  ];
  return remoteAreas.includes(state);
}