import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromSession,
  createAuthErrorResponse,
} from "@/lib/auth/userSession";
import {
  generateInvoiceHTML,
  generateInvoicePDF,
} from "@/lib/invoice/generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get authenticated user
    const authResult = await getUserFromSession(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "pdf";

    // Get order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: dbUser.id,
      },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if invoice exists for this order
    const invoice = order.invoices[0];
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not available for this order yet" },
        { status: 404 }
      );
    }

    // Only allow invoice download for delivered or shipped orders
    if (!["DELIVERED", "SHIPPED", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        { error: "Invoice not available for orders in this status" },
        { status: 400 }
      );
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

      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // Return invoice metadata
    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        status: invoice.status,
      },
    });
  } catch (error) {
    console.error("Customer invoice error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve invoice" },
      { status: 500 }
    );
  }
}
