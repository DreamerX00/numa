import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/admin'
import { z } from 'zod'
import { OrderStatus, FulfillmentStatus } from '@prisma/client'
import { sendEmail } from '@/lib/email/service'

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
  shippingCarrier: z.string().optional(),
  notes: z.string().optional(),
  notifyCustomer: z.boolean().default(true)
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    // Check admin permissions
    const adminCheck = await requireAdmin(request)
    if (adminCheck instanceof NextResponse) return adminCheck

    const body = await request.json()
    const validatedData = updateOrderStatusSchema.parse(body)
    const orderId = id

    // Get current order
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Determine fulfillment status based on order status
    let fulfillmentStatus: FulfillmentStatus = existingOrder.fulfillmentStatus
    
    switch (validatedData.status) {
      case 'PENDING':
      case 'CONFIRMED':
        fulfillmentStatus = 'UNFULFILLED'
        break
      case 'PROCESSING':
        fulfillmentStatus = 'PARTIALLY_FULFILLED'
        break
      case 'SHIPPED':
        fulfillmentStatus = 'FULFILLED'
        break
      case 'DELIVERED':
        fulfillmentStatus = 'FULFILLED'
        break
      case 'CANCELLED':
      case 'REFUNDED':
        fulfillmentStatus = 'UNFULFILLED'
        break
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validatedData.status as OrderStatus,
        fulfillmentStatus,
        ...(validatedData.trackingNumber && { trackingNumber: validatedData.trackingNumber }),
        ...(validatedData.status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(validatedData.status === 'DELIVERED' && { deliveredAt: new Date() }),
        updatedAt: new Date()
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    })

    // Send email notification if requested
    if (validatedData.notifyCustomer && existingOrder.user.email) {
      try {
        const customerName = existingOrder.user.profile?.firstName || 
                           existingOrder.user.profile?.displayName || 
                           'Valued Customer'

        let subject = ''
        let templateType = ''

        switch (validatedData.status) {
          case 'CONFIRMED':
            subject = `Order Confirmed - ${existingOrder.orderNumber}`
            templateType = 'orderConfirmed'
            break
          case 'PROCESSING':
            subject = `Order Processing - ${existingOrder.orderNumber}`
            templateType = 'orderProcessing'
            break
          case 'SHIPPED':
            subject = `Order Shipped - ${existingOrder.orderNumber}`
            templateType = 'orderShipped'
            break
          case 'DELIVERED':
            subject = `Order Delivered - ${existingOrder.orderNumber}`
            templateType = 'orderDelivered'
            break
          case 'CANCELLED':
            subject = `Order Cancelled - ${existingOrder.orderNumber}`
            templateType = 'orderCancelled'
            break
          default:
            templateType = 'orderStatusUpdate'
            subject = `Order Update - ${existingOrder.orderNumber}`
        }

        const emailData = {
          customerName,
          orderNumber: existingOrder.orderNumber,
          status: validatedData.status,
          trackingNumber: validatedData.trackingNumber,
          shippingCarrier: validatedData.shippingCarrier,
          items: existingOrder.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: existingOrder.totalAmount,
          shippingAddress: existingOrder.shippingAddress,
          notes: validatedData.notes
        }

        await sendEmail({
          to: existingOrder.user.email,
          subject,
          template: templateType,
          data: emailData
        })
      } catch (emailError) {
        console.error('Failed to send order status email:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Handle inventory for cancelled orders
    if (validatedData.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      try {
        // Restore inventory for cancelled order
        for (const item of existingOrder.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.quantity }
            }
          })

          // Log inventory change
          await prisma.inventoryLog.create({
            data: {
              productId: item.productId,
              type: 'RESTOCK',
              quantity: item.quantity,
              reason: `Order cancelled: ${existingOrder.orderNumber}`,
              orderId: existingOrder.id,
              notes: `Restocked ${item.quantity} units due to order cancellation`
            }
          })
        }
      } catch (inventoryError) {
        console.error('Failed to restore inventory for cancelled order:', inventoryError)
        // Log but don't fail the request
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        fulfillmentStatus: updatedOrder.fulfillmentStatus,
        trackingNumber: updatedOrder.trackingNumber,
        shippedAt: updatedOrder.shippedAt,
        deliveredAt: updatedOrder.deliveredAt,
        updatedAt: updatedOrder.updatedAt
      },
      message: `Order status updated to ${validatedData.status}`
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    // Check admin permissions
    const adminCheck = await requireAdmin(request)
    if (adminCheck instanceof NextResponse) return adminCheck

    const orderId = id

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
                id: true,
                name: true,
                images: true,
                sku: true,
                slug: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}