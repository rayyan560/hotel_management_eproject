const generateInvoiceHtml = (invoice) => {
  const itemsRows = (invoice.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #2d3748; color: #e2e8f0;">${idx + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2d3748; color: #f8fafc; font-weight: 500;">
          ${item.description}
          <div style="font-size: 11px; color: #d4af37; text-transform: uppercase;">Category: ${item.category}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #2d3748; text-align: center; color: #cbd5e1;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2d3748; text-align: right; color: #cbd5e1;">$${Number(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2d3748; text-align: right; color: #f8fafc; font-weight: 600;">$${Number(item.totalPrice).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.invoiceNumber} | LuxuryStay Hospitality</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 40px 20px;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #d4af37;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 1px;
      margin: 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .invoice-badge {
      text-align: right;
    }
    .invoice-badge h2 {
      margin: 0;
      font-size: 24px;
      color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 6px;
      background: ${invoice.paymentStatus === 'Paid' ? '#065f46' : '#991b1b'};
      color: ${invoice.paymentStatus === 'Paid' ? '#34d399' : '#fca5a5'};
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .info-block h4 {
      color: #d4af37;
      margin: 0 0 8px 0;
      font-size: 13px;
      text-transform: uppercase;
    }
    .info-block p {
      margin: 4px 0;
      color: #cbd5e1;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #1f2937;
      color: #d4af37;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-box {
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #1f2937;
      font-size: 14px;
      color: #cbd5e1;
    }
    .grand-total {
      font-size: 18px;
      font-weight: 700;
      color: #d4af37;
      border-top: 2px solid #d4af37;
      border-bottom: none;
      padding-top: 12px;
    }
    .footer {
      text-align: center;
      border-top: 1px solid #1f2937;
      padding-top: 20px;
      color: #64748b;
      font-size: 13px;
    }
    .print-btn {
      background: #d4af37;
      color: #0b0f19;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 20px;
    }
    @media print {
      .print-btn { display: none; }
      body { background: white; color: black; }
      .invoice-card { border: none; box-shadow: none; background: white; color: black; }
      th { background: #f1f5f9; color: black; }
      td { color: black !important; }
      .brand-title { color: #854d0e; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; text-align: right;">
    <button class="print-btn" onclick="window.print()">Print Official Invoice</button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div>
        <h1 class="brand-title">LUXURYSTAY</h1>
        <div class="brand-sub">Hospitality & Suites</div>
        <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">742 Evergreen Terrace, Beverly Hills, CA<br>Phone: +1-800-589-8798</p>
      </div>
      <div class="invoice-badge">
        <h2>INVOICE</h2>
        <p style="margin: 4px 0; color: #94a3b8;">${invoice.invoiceNumber}</p>
        <span class="badge">${invoice.paymentStatus.toUpperCase()}</span>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-block">
        <h4>Billed To:</h4>
        <p><strong>${invoice.guestName}</strong></p>
        <p>Email: ${invoice.guestEmail}</p>
        <p>Room: #${invoice.roomNumber}</p>
      </div>
      <div class="info-block">
        <h4>Invoice Details:</h4>
        <p>Date Issued: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</p>
        <p>Payment Method: ${invoice.paymentMethod || 'Pending'}</p>
        <p>Payment Date: ${invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${Number(invoice.subTotal || 0).toFixed(2)}</span>
        </div>
        ${
          invoice.discountAmount > 0
            ? `<div class="total-row">
                <span>Discount (${invoice.discountPercent}%):</span>
                <span>-$${Number(invoice.discountAmount).toFixed(2)}</span>
              </div>`
            : ''
        }
        <div class="total-row">
          <span>Tax (${invoice.taxRate}%):</span>
          <span>$${Number(invoice.taxAmount || 0).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>Grand Total:</span>
          <span>$${Number(invoice.grandTotal || 0).toFixed(2)}</span>
        </div>
        <div class="total-row" style="color: #34d399; font-weight: 600;">
          <span>Amount Paid:</span>
          <span>$${Number(invoice.amountPaid || 0).toFixed(2)}</span>
        </div>
        <div class="total-row" style="color: ${invoice.balanceDue > 0 ? '#f87171' : '#94a3b8'}; font-weight: 600;">
          <span>Balance Due:</span>
          <span>$${Number(invoice.balanceDue || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing <strong>LuxuryStay Hospitality</strong>. We appreciate your patronage!</p>
      <p style="font-size: 11px;">For inquiries or corporate billing, please email billing@luxurystay.com</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = { generateInvoiceHtml };
