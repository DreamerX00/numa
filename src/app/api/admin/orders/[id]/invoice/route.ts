import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, verifyAdminAuth } from "@/lib/auth/admin";
import {
  generateInvoicePDF,
  generateInvoiceHTML,
} from "@/lib/invoice/generator";
import { getCompanySettings } from "@/lib/services/companySettings";
import { InvoiceStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  // Get admin email for audit trail
  const authResult = await verifyAdminAuth(request);
  const adminEmail = authResult.success ? authResult.sessionUser?.email : null;

  try {
    const orderId = id;
    const { format = "pdf", regenerate = false } = await request.json();

    // Get order with all necessary details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if invoice already exists
    let invoice = order.invoices[0];

    if (!invoice || regenerate) {
      // Generate new invoice number (only if no invoice exists)
      const invoiceNumber =
        invoice?.invoiceNumber ||
        `INV-${new Date().getFullYear()}-${String((await prisma.invoice.count()) + 1).padStart(6, "0")}`;

      // Calculate GST (India specific - 18% GST)
      const gstRate = 0.18;
      const subtotalWithoutGst = order.subtotal / (1 + gstRate);
      const gstAmount = order.subtotal - subtotalWithoutGst;

      // Determine CGST/SGST vs IGST based on state
      const businessState = "MAHARASHTRA"; // This should come from settings
      const customerState =
        order.shippingAddress?.state?.toUpperCase() ||
        order.billingAddress?.state?.toUpperCase() ||
        "";

      const isIntrastate = businessState === customerState;
      const cgst = isIntrastate ? gstAmount / 2 : 0;
      const sgst = isIntrastate ? gstAmount / 2 : 0;
      const igst = isIntrastate ? 0 : gstAmount;

      // Prepare customer information
      const customerName =
        order.user.profile?.firstName && order.user.profile?.lastName
          ? `${order.user.profile.firstName} ${order.user.profile.lastName}`
          : order.user.email;

      // Prepare invoice items (frozen data)
      const invoiceItems = order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        productName: item.product.name,
        sku: item.sku || item.product.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        image: item.product.images[0] || null,
      }));

      // Get company information from settings (with fallback to defaults)
      const settings = await getCompanySettings();

      const companyInfo = {
        name: settings.companyName,
        address: `${settings.companyAddress}, ${settings.companyCity}, ${settings.companyState} ${settings.companyZipCode}`,
        gstin: settings.gstin,
        phone: settings.companyPhone,
        email: settings.companyEmail,
        website: settings.companyWebsite,
        state: settings.companyState,
      };

      const invoiceData = {
        orderId: order.id,
        invoiceNumber,
        invoiceDate: invoice?.invoiceDate || new Date(),
        dueDate:
          invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: subtotalWithoutGst,
        taxAmount: gstAmount,
        shippingAmount: order.shippingAmount,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        currency: order.currency,
        cgst,
        sgst,
        igst,
        gstRate,
        customerName,
        customerEmail: order.user.email,
        customerPhone:
          order.user.profile?.phone || order.shippingAddress?.phone,
        billingAddress: order.billingAddress
          ? JSON.parse(JSON.stringify(order.billingAddress))
          : order.shippingAddress
            ? JSON.parse(JSON.stringify(order.shippingAddress))
            : null,
        shippingAddress: order.shippingAddress
          ? JSON.parse(JSON.stringify(order.shippingAddress))
          : null,
        invoiceItems,
        companyInfo,
        status: InvoiceStatus.SENT,
        generatedBy: adminEmail,
      };

      if (invoice) {
        // Update existing invoice
        invoice = await prisma.invoice.update({
          where: { id: invoice.id },
          data: invoiceData,
        });
      } else {
        // Create new invoice record with complete data
        invoice = await prisma.invoice.create({
          data: invoiceData,
        });
      }
    }

    // Generate invoice content using stored data
    if (format === "pdf") {
      const pdfBuffer = await generateInvoicePDF(invoice);

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        },
      });
    } else if (format === "html") {
      const htmlContent = await generateInvoiceHTML(invoice);

      // Update invoice with HTML content if not already stored
      if (!invoice.htmlContent) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { htmlContent },
        });
      }

      return NextResponse.json({
        invoice,
        htmlContent,
      });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const orderId = id;

    // Get existing invoices for the order
    const invoices = await prisma.invoice.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
