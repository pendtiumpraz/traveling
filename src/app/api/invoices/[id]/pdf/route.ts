import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/invoices/[id]/pdf
 * Generate PDF invoice (returns HTML for now, can be converted to PDF with puppeteer)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id, isDeleted: false },
      include: {
        booking: {
          include: {
            customer: true,
            schedule: {
              include: {
                package: true,
              },
            },
            tenant: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    // Get status for styling
    const getStatusLabel = () => {
      const balance = Number(invoice.balance);
      if (balance <= 0) return { text: "LUNAS", class: "paid" };
      if (new Date() > invoice.dueDate)
        return { text: "JATUH TEMPO", class: "overdue" };
      return { text: "BELUM LUNAS", class: "unpaid" };
    };

    const status = getStatusLabel();

    // Generate HTML Invoice
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #10b981; }
    .logo { font-size: 28px; font-weight: bold; color: #10b981; }
    .logo span { color: #333; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 24px; font-weight: bold; color: #10b981; }
    .invoice-date { color: #666; margin-top: 5px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .status.paid { background: #d1fae5; color: #059669; }
    .status.unpaid { background: #fef3c7; color: #d97706; }
    .status.overdue { background: #fee2e2; color: #dc2626; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { width: 45%; }
    .party-label { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 10px; font-weight: 600; }
    .party-name { font-size: 18px; font-weight: 600; margin-bottom: 5px; }
    .party-detail { color: #666; font-size: 14px; }
    .items { margin-bottom: 30px; }
    .items table { width: 100%; border-collapse: collapse; }
    .items th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
    .items td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .items .amount { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .totals-row.subtotal { border-top: 1px solid #e5e7eb; margin-top: 10px; padding-top: 15px; }
    .totals-row.total { border-top: 2px solid #10b981; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: bold; color: #10b981; }
    .totals-row.balance { color: #dc2626; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .footer-note { color: #666; font-size: 14px; margin-bottom: 20px; }
    .bank-info { background: #f9fafb; padding: 20px; border-radius: 8px; }
    .bank-title { font-weight: 600; margin-bottom: 10px; }
    .bank-detail { font-size: 14px; color: #666; }
    .thank-you { text-align: center; margin-top: 40px; color: #10b981; font-size: 18px; font-weight: 600; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .invoice { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="logo">Travel<span>ERP</span></div>
        <div style="margin-top: 10px; color: #666; font-size: 14px;">
          ${invoice.booking?.tenant?.name || "Travel Agency"}<br>
          Jl. Contoh No. 123, Jakarta<br>
          Phone: 021-1234567
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">${invoice.invoiceNo}</div>
        <div class="invoice-date">Tanggal: ${formatDate(invoice.createdAt)}</div>
        <div class="invoice-date">Jatuh Tempo: ${formatDate(invoice.dueDate)}</div>
        <div class="status ${status.class}">${status.text}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">Tagihan Kepada</div>
        <div class="party-name">${invoice.booking?.customer?.fullName || "-"}</div>
        <div class="party-detail">
          ${invoice.booking?.customer?.email || "-"}<br>
          ${invoice.booking?.customer?.phone || "-"}<br>
          ${invoice.booking?.customer?.address || "-"}
        </div>
      </div>
      <div class="party">
        <div class="party-label">Detail Booking</div>
        <div class="party-name">${invoice.booking?.bookingCode || "-"}</div>
        <div class="party-detail">
          ${invoice.booking?.schedule?.package?.name || "-"}<br>
          Keberangkatan: ${invoice.booking?.schedule ? formatDate(invoice.booking.schedule.departureDate) : "-"}<br>
          Room: ${invoice.booking?.roomType || "-"}
        </div>
      </div>
    </div>

    <div class="items">
      <table>
        <thead>
          <tr>
            <th>Deskripsi</th>
            <th>Qty</th>
            <th>Harga</th>
            <th class="amount">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${invoice.booking?.schedule?.package?.name || "Paket Perjalanan"}</strong><br>
              <span style="color: #666; font-size: 13px;">
                Room: ${invoice.booking?.roomType || "-"} | 
                ${invoice.booking?.schedule?.package?.duration || 0} Hari
              </span>
            </td>
            <td>1</td>
            <td>${formatCurrency(Number(invoice.subtotal))}</td>
            <td class="amount">${formatCurrency(Number(invoice.subtotal))}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(Number(invoice.subtotal))}</span>
      </div>
      ${
        Number(invoice.discount) > 0
          ? `
      <div class="totals-row">
        <span>Diskon</span>
        <span>-${formatCurrency(Number(invoice.discount))}</span>
      </div>
      `
          : ""
      }
      ${
        Number(invoice.tax) > 0
          ? `
      <div class="totals-row">
        <span>Pajak</span>
        <span>${formatCurrency(Number(invoice.tax))}</span>
      </div>
      `
          : ""
      }
      <div class="totals-row total">
        <span>Total</span>
        <span>${formatCurrency(Number(invoice.total))}</span>
      </div>
      ${
        Number(invoice.paidAmount) > 0
          ? `
      <div class="totals-row">
        <span>Sudah Dibayar</span>
        <span>-${formatCurrency(Number(invoice.paidAmount))}</span>
      </div>
      `
          : ""
      }
      ${
        Number(invoice.balance) > 0
          ? `
      <div class="totals-row balance">
        <span>Sisa Tagihan</span>
        <span>${formatCurrency(Number(invoice.balance))}</span>
      </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <div class="footer-note">
        ${invoice.notes || "Terima kasih atas kepercayaan Anda. Pembayaran dapat dilakukan melalui transfer bank ke rekening berikut:"}
      </div>
      <div class="bank-info">
        <div class="bank-title">Informasi Pembayaran</div>
        <div class="bank-detail">
          <strong>Bank BCA</strong><br>
          No. Rekening: 123-456-7890<br>
          Atas Nama: PT Travel ERP Indonesia<br><br>
          <strong>Bank Mandiri</strong><br>
          No. Rekening: 098-765-4321<br>
          Atas Nama: PT Travel ERP Indonesia
        </div>
      </div>
    </div>

    <div class="thank-you">
      Terima kasih atas kepercayaan Anda! 🙏
    </div>
  </div>

  <script>
    // Auto print when loaded (optional)
    // window.onload = function() { window.print(); }
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Generate invoice PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 },
    );
  }
}
