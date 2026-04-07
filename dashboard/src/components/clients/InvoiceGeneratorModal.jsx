import { useState } from 'react';
import { X, FileDown, Building, Calendar, Hash } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ActionToast from '../shared/ActionToast';

function generateInvoiceNumber() {
  const prefix = 'AET';
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${num}`;
}

export default function InvoiceGeneratorModal({ client, onClose }) {
  const [toastVisible, setToastVisible] = useState(false);
  const invoiceNumber = generateInvoiceNumber();
  const today = new Date().toISOString();
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const subtotal = client.totalProjectValue;
  const taxRate = 0;
  const tax = subtotal * taxRate;
  const total = subtotal - client.amountPaid;

  function handleDownload() {
    setToastVisible(true);
  }

  if (!client) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-modal animate-fade-in">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileDown size={18} className="text-accent" />
              <h2 className="text-base font-semibold text-text">Invoice Preview</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-bg-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Invoice document */}
          <div className="p-8">
            <div className="bg-white border border-border rounded-xl p-8 space-y-8">
              {/* Invoice header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-text tracking-tight">AEITRON</h1>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest">Agency</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-accent tracking-tight">INVOICE</h2>
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-xs text-text-muted">
                    <Hash size={11} />
                    <span className="font-mono">{invoiceNumber}</span>
                  </div>
                </div>
              </div>

              {/* From / To */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-border-light">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">From</p>
                  <p className="text-sm font-semibold text-text">Aeitron Agency</p>
                  <p className="text-xs text-text-muted mt-0.5">hello@aeitron.com</p>
                  <p className="text-xs text-text-muted">www.aeitron.com</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Bill To</p>
                  <p className="text-sm font-semibold text-text">{client.clientName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building size={11} className="text-text-muted" />
                    <p className="text-xs text-text-muted">{client.companyName}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-text-muted" />
                  <p className="text-xs text-text-muted">
                    <span className="font-medium text-text">Issue Date:</span> {formatDate(today)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-text-muted" />
                  <p className="text-xs text-text-muted">
                    <span className="font-medium text-text">Due Date:</span> {formatDate(dueDate)}
                  </p>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg">
                      <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest font-semibold text-text-muted">Description</th>
                      <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-widest font-semibold text-text-muted">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border-light">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text">{client.serviceType}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Project for {client.companyName} &mdash; {client.milestones || 0}% complete
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                    {client.amountPaid > 0 && (
                      <tr className="border-t border-border-light">
                        <td className="px-4 py-3">
                          <p className="text-sm text-text-muted">Payments Received</p>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-success" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          -{formatCurrency(client.amountPaid)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-bg/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-text">Amount Due</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className={`text-lg font-bold ${total > 0 ? 'text-danger' : 'text-success'}`} style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(total)}
                        </p>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment terms */}
              <div className="pt-4 border-t border-border-light">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-1.5">Payment Terms</p>
                <p className="text-xs text-text-muted">
                  Payment is due within 30 days of the invoice date. Please reference invoice
                  number <span className="font-mono font-medium text-text">{invoiceNumber}</span> when
                  making payment.
                </p>
              </div>
            </div>
          </div>

          {/* Footer with download button */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-text-muted hover:text-text rounded-lg hover:bg-bg-hover transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <FileDown size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {toastVisible && (
        <ActionToast
          message="PDF download coming soon"
          status="success"
          duration={2500}
          onDismiss={() => setToastVisible(false)}
        />
      )}
    </>
  );
}
