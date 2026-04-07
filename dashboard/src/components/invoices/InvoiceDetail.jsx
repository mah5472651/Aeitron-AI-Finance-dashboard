import { X, Printer, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { INVOICE_STATUS_COLORS } from '../../utils/constants';

export default function InvoiceDetail({ invoice, onClose }) {
  if (!invoice) return null;

  function handlePrint() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1d26; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .brand { font-size: 24px; font-weight: 700; color: #6c5ce7; }
          .invoice-label { font-size: 28px; font-weight: 300; color: #8c90a0; text-transform: uppercase; letter-spacing: 2px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .meta-group h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8c90a0; margin-bottom: 8px; }
          .meta-group p { font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f4f5f7; padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #8c90a0; font-weight: 600; }
          td { padding: 12px 16px; border-bottom: 1px solid #e2e4ea; font-size: 14px; }
          .text-right { text-align: right; }
          .total-row { border-top: 2px solid #1a1d26; }
          .total-row td { font-weight: 700; font-size: 16px; padding-top: 16px; }
          .notes { background: #f4f5f7; padding: 16px; border-radius: 8px; font-size: 13px; color: #4a4f5e; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Aeitron AI</div>
            <p style="font-size:13px;color:#8c90a0;margin-top:4px">Finance Dashboard</p>
          </div>
          <div style="text-align:right">
            <div class="invoice-label">Invoice</div>
            <p style="font-size:16px;font-weight:600;margin-top:4px">${invoice.invoiceNumber}</p>
          </div>
        </div>
        <div class="meta">
          <div class="meta-group">
            <h3>Bill To</h3>
            <p><strong>${invoice.clientName}</strong><br>${invoice.companyName}</p>
          </div>
          <div class="meta-group" style="text-align:right">
            <h3>Invoice Details</h3>
            <p>
              Status: <strong>${invoice.status}</strong><br>
              Issued: ${formatDate(invoice.issueDate)}<br>
              Due: ${formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems.map((item) => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" class="text-right">Total</td>
              <td class="text-right">${formatCurrency(invoice.total)}</td>
            </tr>
          </tbody>
        </table>
        ${invoice.notes ? `<div class="notes"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function handleExportCSV() {
    const rows = [
      ['Invoice', invoice.invoiceNumber],
      ['Client', invoice.clientName],
      ['Company', invoice.companyName],
      ['Status', invoice.status],
      ['Issue Date', invoice.issueDate],
      ['Due Date', invoice.dueDate],
      [''],
      ['Description', 'Quantity', 'Unit Price', 'Total'],
      ...invoice.lineItems.map((item) => [
        item.description,
        item.quantity,
        item.unitPrice,
        item.total,
      ]),
      [''],
      ['Total', '', '', invoice.total],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Invoice {invoice.invoiceNumber}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-text-muted hover:text-accent rounded-lg hover:bg-bg-hover transition-colors"
              title="Print"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2 text-text-muted hover:text-accent rounded-lg hover:bg-bg-hover transition-colors"
              title="Export CSV"
            >
              <Download size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-bg-hover transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice preview */}
        <div className="p-6 space-y-6">
          {/* Top section */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-accent">Aeitron AI</h3>
              <p className="text-xs text-text-muted">Finance Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light text-text-muted uppercase tracking-widest">Invoice</p>
              <p className="text-base font-semibold text-text mt-1">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Client & details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">Bill To</p>
              <p className="text-sm font-medium text-text">{invoice.clientName}</p>
              <p className="text-sm text-text-muted">{invoice.companyName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">Details</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-text-muted">Status: </span>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                    {invoice.status}
                  </span>
                </p>
                <p><span className="text-text-muted">Issued: </span><span className="text-text">{formatDate(invoice.issueDate)}</span></p>
                <p><span className="text-text-muted">Due: </span><span className="text-text">{formatDate(invoice.dueDate)}</span></p>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-bg">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, i) => (
                  <tr key={i} className="border-t border-border-light">
                    <td className="px-4 py-3 text-sm text-text">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-text-muted text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-text-muted text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-text">
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-text text-right">Total</td>
                  <td className="px-4 py-3 text-base font-bold text-text text-right">{formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-bg rounded-lg p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-text-secondary">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
