// Types for invoice data stored in database
interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  productName: string;
  sku: string | null;
  quantity: number;
  price: number;
  total: number;
  image: string | null;
}

interface CompanyInfo {
  name: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  website: string;
  state: string;
}

interface InvoiceAddress {
  firstName?: string;
  lastName?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface StoredInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date | null;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  cgst: number;
  sgst: number;
  igst: number;
  gstRate: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  billingAddress: unknown;
  shippingAddress: unknown;
  invoiceItems: unknown;
  companyInfo: unknown;
  status: string;
  generatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function generateInvoiceHTML(invoice: StoredInvoice): Promise<string> {
  // Extract data from stored invoice
  const companyDetails = (invoice.companyInfo || {}) as unknown as CompanyInfo;
  const invoiceItems = (invoice.invoiceItems || []) as unknown as InvoiceItem[];
  const billingAddress = (invoice.billingAddress || {}) as unknown as InvoiceAddress;
  const shippingAddress = invoice.shippingAddress as unknown as InvoiceAddress | null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency || 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #000;
            }
            
            .company-info h1 {
                font-size: 28px;
                color: #d4af37;
                margin-bottom: 10px;
            }
            
            .company-info p {
                margin: 2px 0;
                font-size: 14px;
            }
            
            .invoice-info {
                text-align: right;
            }
            
            .invoice-info h2 {
                font-size: 24px;
                color: #333;
                margin-bottom: 10px;
            }
            
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .bill-to, .ship-to {
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 5px;
            }
            
            .bill-to h3, .ship-to h3 {
                color: #d4af37;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .items-table th,
            .items-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .items-table th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            
            .items-table .text-right {
                text-align: right;
            }
            
            .totals {
                margin-left: auto;
                width: 300px;
            }
            
            .totals table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .totals td {
                padding: 8px 12px;
                border-bottom: 1px solid #eee;
            }
            
            .totals .total-row {
                font-weight: bold;
                font-size: 16px;
                background-color: #f8f9fa;
                border-top: 2px solid #d4af37;
            }
            
            .gst-section {
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            
            .gst-section h4 {
                color: #d4af37;
                margin-bottom: 10px;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
            }
            
            .payment-terms {
                margin-top: 20px;
                padding: 15px;
                background-color: #fff3cd;
                border-left: 4px solid #d4af37;
            }
            
            @media print {
                body { 
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .invoice-container {
                    border: none;
                    margin: 0;
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    <h1>${companyDetails.name}</h1>
                    <p>${companyDetails.address}</p>
                    <p>GSTIN: ${companyDetails.gstin}</p>
                    <p>Phone: ${companyDetails.phone}</p>
                    <p>Email: ${companyDetails.email}</p>
                </div>
                <div class="invoice-info">
                    <h2>TAX INVOICE</h2>
                    <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
                    <p><strong>Date:</strong> ${formatDate(invoice.invoiceDate)}</p>
                    <p><strong>Order ID:</strong> ${invoice.orderId}</p>
                    ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
                </div>
            </div>

            <!-- Customer Details -->
            <div class="invoice-details">
                <div class="bill-to">
                    <h3>Bill To:</h3>
                    <p><strong>${invoice.customerName}</strong></p>
                    <p>${invoice.customerEmail}</p>
                    ${invoice.customerPhone ? `<p>Phone: ${invoice.customerPhone}</p>` : ''}
                    ${billingAddress ? `
                        <p>${billingAddress.address1}</p>
                        ${billingAddress.address2 ? `<p>${billingAddress.address2}</p>` : ''}
                        <p>${billingAddress.city}, ${billingAddress.state} ${billingAddress.zipCode}</p>
                        <p>${billingAddress.country}</p>
                    ` : ''}
                </div>
                
                ${shippingAddress ? `
                <div class="ship-to">
                    <h3>Ship To:</h3>
                    <p><strong>${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}</strong></p>
                    <p>${shippingAddress.address1}</p>
                    ${shippingAddress.address2 ? `<p>${shippingAddress.address2}</p>` : ''}
                    <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
                    <p>${shippingAddress.country}</p>
                    ${shippingAddress.phone ? `<p>Phone: ${shippingAddress.phone}</p>` : ''}
                </div>
                ` : ''}
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Sr. No.</th>
                        <th>Description</th>
                        <th>SKU</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceItems.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                <strong>${item.productName}</strong>
                                ${item.name !== item.productName ? `<br><small>${item.name}</small>` : ''}
                            </td>
                            <td>${item.sku || '-'}</td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">${formatCurrency(item.price)}</td>
                            <td class="text-right">${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Totals -->
            <div class="totals">
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">${formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    ${invoice.shippingAmount > 0 ? `
                    <tr>
                        <td>Shipping:</td>
                        <td class="text-right">${formatCurrency(invoice.shippingAmount)}</td>
                    </tr>
                    ` : ''}
                    ${invoice.discountAmount > 0 ? `
                    <tr>
                        <td>Discount:</td>
                        <td class="text-right">-${formatCurrency(invoice.discountAmount)}</td>
                    </tr>
                    ` : ''}
                    ${invoice.cgst > 0 ? `
                    <tr>
                        <td>CGST (${(invoice.gstRate * 100 / 2).toFixed(1)}%):</td>
                        <td class="text-right">${formatCurrency(invoice.cgst)}</td>
                    </tr>
                    <tr>
                        <td>SGST (${(invoice.gstRate * 100 / 2).toFixed(1)}%):</td>
                        <td class="text-right">${formatCurrency(invoice.sgst)}</td>
                    </tr>
                    ` : ''}
                    ${invoice.igst > 0 ? `
                    <tr>
                        <td>IGST (${(invoice.gstRate * 100).toFixed(1)}%):</td>
                        <td class="text-right">${formatCurrency(invoice.igst)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td><strong>Total Amount:</strong></td>
                        <td class="text-right"><strong>${formatCurrency(invoice.totalAmount)}</strong></td>
                    </tr>
                </table>
            </div>

            <!-- GST Summary -->
            ${invoice.taxAmount > 0 ? `
            <div class="gst-section">
                <h4>GST Summary</h4>
                <p>GST Registration No: ${companyDetails.gstin}</p>
                <p>Total Taxable Amount: ${formatCurrency(invoice.subtotal)}</p>
                <p>Total GST Amount: ${formatCurrency(invoice.taxAmount)}</p>
                <p>HSN/SAC: 71131990 (Jewelry Articles)</p>
            </div>
            ` : ''}

            <!-- Payment Terms -->
            <div class="payment-terms">
                <h4>Payment Terms & Conditions:</h4>
                <ul>
                    <li>Payment is due within 30 days of invoice date</li>
                    <li>All prices are in ${invoice.currency}</li>
                    <li>Goods once sold cannot be returned without prior authorization</li>
                    <li>Any disputes should be reported within 7 days of delivery</li>
                </ul>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p><strong>Thank you for your business!</strong></p>
                <p>This is a computer-generated invoice and does not require a physical signature.</p>
                <p>Generated on: ${formatDate(new Date())} ${invoice.generatedBy ? `by ${invoice.generatedBy}` : ''}</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return html;
}

export async function generateInvoicePDF(invoice: StoredInvoice): Promise<Buffer> {
  // For now, we'll return the HTML content as a placeholder
  // In a real implementation, you would use a library like puppeteer or jsPDF
  const htmlContent = await generateInvoiceHTML(invoice);
  
  // This is a placeholder - you would integrate with a PDF generation library
  // Example with puppeteer:
  /*
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });
  await browser.close();
  return pdfBuffer;
  */
  
  // For now, return HTML as buffer
  return Buffer.from(htmlContent, 'utf8');
}