import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { exportInvoiceToPDF, buildPDFFilename } from '../../utils/pdfExport';
import { formatCurrencyByCode } from '../../utils/formatters';

// All colors are hardcoded hex — html2canvas cannot resolve CSS custom properties
const C = {
  bg:       '#ffffff',
  bgLight:  '#f4f5f7',
  border:   '#e2e4ea',
  text:     '#1a1d26',
  muted:    '#8c90a0',
  accent:   '#6c5ce7',
  success:  '#10b981',
  danger:   '#ef4444',
  warning:  '#f59e0b',
  info:     '#3b82f6',
};

const MONO = { fontFamily: "'JetBrains Mono', 'Courier New', monospace" };

const STATUS_COLORS = {
  Draft:     { bg: '#f0f1f4', text: C.muted },
  Sent:      { bg: '#eff6ff', text: C.info },
  Paid:      { bg: '#ecfdf5', text: C.success },
  Overdue:   { bg: '#fef2f2', text: C.danger },
  Cancelled: { bg: '#fffbeb', text: C.warning },
};

const WATERMARK_COLORS = {
  Draft:   C.muted,
  Overdue: C.danger,
  Paid:    C.success,
  Sent:    C.info,
};

function fmt(amount, currency) {
  return formatCurrencyByCode(amount || 0, currency || 'USD');
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SEAL_GRAD_ID = 'aeitronSealGrad';

function DigitalSeal() {
  return (
    <svg
      width="110" height="110" viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', opacity: 0.82 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={SEAL_GRAD_ID} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a56db" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <path id="sealTopArc"    d="M 16,60 A 44,44 0 0,1 104,60" fill="none" />
        <path id="sealBottomArc" d="M 23,70 A 37,37 0 0,0 97,70"  fill="none" />
      </defs>

      {/* Outer ring */}
      <circle cx="60" cy="60" r="57" fill="none" stroke={`url(#${SEAL_GRAD_ID})`} strokeWidth="2.5" />
      {/* Inner ring — double-border effect */}
      <circle cx="60" cy="60" r="51" fill="none" stroke={`url(#${SEAL_GRAD_ID})`} strokeWidth="1.2" />
      {/* Very subtle fill tint */}
      <circle cx="60" cy="60" r="50" fill="#1a56db" fillOpacity="0.04" />

      {/* 9 o'clock / 3 o'clock accent dots */}
      <circle cx="14"  cy="60" r="3" fill={`url(#${SEAL_GRAD_ID})`} />
      <circle cx="106" cy="60" r="3" fill={`url(#${SEAL_GRAD_ID})`} />

      {/* Centre brand name */}
      <text
        x="60" y="57" textAnchor="middle" dominantBaseline="middle"
        fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="15"
        fill={`url(#${SEAL_GRAD_ID})`} letterSpacing="2.5"
      >
        AEITRON
      </text>

      {/* Divider pair */}
      <line x1="28" y1="63" x2="92" y2="63" stroke={`url(#${SEAL_GRAD_ID})`} strokeWidth="0.8" opacity="0.45" />
      <line x1="28" y1="67" x2="92" y2="67" stroke={`url(#${SEAL_GRAD_ID})`} strokeWidth="0.8" opacity="0.45" />

      {/* Sub-label between dividers */}
      <text
        x="60" y="78" textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif" fontWeight="600" fontSize="7"
        fill={`url(#${SEAL_GRAD_ID})`} letterSpacing="1.8"
      >
        AI SYSTEMS
      </text>

      {/* Curved top arc text — VERIFIED DOCUMENT */}
      <text
        fontFamily="Inter, Arial, sans-serif" fontSize="8.5" fontWeight="700"
        fill={`url(#${SEAL_GRAD_ID})`} letterSpacing="2"
      >
        <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
          VERIFIED DOCUMENT
        </textPath>
      </text>

      {/* Curved bottom arc text — OFFICIAL SEAL */}
      <text
        fontFamily="Inter, Arial, sans-serif" fontSize="7.5" fontWeight="500"
        fill={`url(#${SEAL_GRAD_ID})`} letterSpacing="1.8"
      >
        <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
          OFFICIAL SEAL
        </textPath>
      </text>
    </svg>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function Divider({ marginY = 16 }) {
  return <div style={{ borderTop: `1px solid ${C.border}`, margin: `${marginY}px 0` }} />;
}

export default function InvoicePreview({ invoice }) {
  const [exporting, setExporting] = useState(false);

  const currency = invoice.currency || 'USD';
  const subtotal  = invoice.subtotal  || 0;
  const taxAmount = invoice.taxAmount || 0;
  const discount  = Math.max(0, parseFloat(invoice.discount) || 0);
  const total     = invoice.total     || 0;

  const statusColor = STATUS_COLORS[invoice.status] || STATUS_COLORS.Draft;
  const watermarkColor = WATERMARK_COLORS[invoice.status];
  const showWatermark = !!watermarkColor;

  const pi = invoice.paymentInstructions || {};
  const bank   = pi.bank   || {};
  const paypal = pi.paypal || {};
  const wise   = pi.wise   || {};
  const hasBankData   = bank.bankName   || bank.iban   || bank.swift;
  const hasPaypalData = paypal.email;
  const hasWiseData   = wise.email;
  const hasPaymentData = hasBankData || hasPaypalData || hasWiseData;

  const lineItems = (invoice.lineItems || []).filter(item => item.description);

  async function handleDownload() {
    setExporting(true);
    try {
      const filename = buildPDFFilename(
        invoice.invoiceNumber || 'INV-0001',
        invoice.clientName || 'Client'
      );
      await exportInvoiceToPDF('invoice-preview-content', filename);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Preview label ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>
          Live Preview
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 11, fontWeight: 500, border: `1px solid ${C.border}`, borderRadius: 6, background: C.bg, color: C.text, cursor: 'pointer' }}
          >
            <Printer size={12} /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, background: C.accent, color: '#fff', cursor: exporting ? 'wait' : 'pointer', opacity: exporting ? 0.7 : 1 }}
          >
            <Download size={12} /> {exporting ? 'Exporting…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── Capturable invoice area ───────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div
          id="invoice-preview-content"
          style={{ background: C.bg, padding: '36px 40px', fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, position: 'relative', minHeight: 700 }}
        >
          {/* Status watermark (Draft / Paid / Overdue / Sent) */}
          {showWatermark && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', userSelect: 'none', zIndex: 0,
            }}>
              <div style={{
                transform: 'rotate(-35deg)', fontSize: 80, fontWeight: 900,
                color: watermarkColor, opacity: 0.06, letterSpacing: '0.08em', textTransform: 'uppercase',
                ...MONO,
              }}>
                {invoice.status}
              </div>
            </div>
          )}

          {/* Brand watermark — always visible, centered at -45° */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', userSelect: 'none', zIndex: 0,
            overflow: 'hidden',
          }}>
            <span style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: '0.18em',
              color: C.accent,
              opacity: 0.055,
              transform: 'rotate(-45deg)',
              whiteSpace: 'nowrap',
              fontFamily: "'Inter', Arial, sans-serif",
            }}>
              AEITRON
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* ── Header: Branding + Invoice label ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {invoice.billFrom?.name || 'Aeitron AI'}
                </div>
                {invoice.billFrom?.address && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>
                    {invoice.billFrom.address}<br />
                    {invoice.billFrom.city}
                    {invoice.billFrom.taxId && <><br />Tax ID: <span style={MONO}>{invoice.billFrom.taxId}</span></>}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  INVOICE
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4, ...MONO }}>
                  {invoice.invoiceNumber || 'INV-0001'}
                </div>
                {invoice.status && (
                  <div style={{
                    display: 'inline-block', marginTop: 8, padding: '3px 10px',
                    background: statusColor.bg, color: statusColor.text,
                    borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    {invoice.status}
                  </div>
                )}
              </div>
            </div>

            <Divider marginY={0} />

            {/* ── Bill From / Bill To ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '20px 0' }}>
              <div>
                <SectionLabel>Bill From</SectionLabel>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{invoice.billFrom?.name || 'Aeitron AI'}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 2 }}>
                  {invoice.billFrom?.address || '—'}<br />
                  {invoice.billFrom?.city || ''}
                </div>
              </div>
              <div>
                <SectionLabel>Bill To</SectionLabel>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{invoice.clientName || '—'}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 2 }}>
                  {invoice.companyName || ''}
                </div>
              </div>
            </div>

            <Divider marginY={0} />

            {/* ── Meta: dates + currency ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '20px 0', background: C.bgLight, padding: '14px 16px', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 3 }}>Issue Date</div>
                <div style={{ fontSize: 12, fontWeight: 600, ...MONO }}>{fmtDate(invoice.issueDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 3 }}>Due Date</div>
                <div style={{ fontSize: 12, fontWeight: 600, ...MONO }}>{fmtDate(invoice.dueDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 3 }}>Currency</div>
                <div style={{ fontSize: 12, fontWeight: 600, ...MONO }}>{currency}</div>
              </div>
            </div>

            {/* ── Line Items Table ── */}
            <div style={{ marginTop: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bgLight }}>
                    {['Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                      <th key={h} style={{
                        padding: '8px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
                        textTransform: 'uppercase', color: C.muted,
                        textAlign: i === 0 ? 'left' : 'right',
                        borderBottom: `1px solid ${C.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length > 0 ? lineItems.map((item, i) => {
                    const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 10px', fontSize: 12, color: C.text }}>{item.description}</td>
                        <td style={{ padding: '10px 10px', fontSize: 12, color: C.text, textAlign: 'right', ...MONO }}>{item.quantity || 1}</td>
                        <td style={{ padding: '10px 10px', fontSize: 12, color: C.text, textAlign: 'right', ...MONO }}>{fmt(parseFloat(item.unitPrice) || 0, currency)}</td>
                        <td style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: C.text, textAlign: 'right', ...MONO }}>{fmt(lineTotal, currency)}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '16px 10px', textAlign: 'center', fontSize: 11, color: C.muted }}>
                        No line items yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Totals ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <div style={{ width: 240 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: C.muted }}>
                  <span>Subtotal</span>
                  <span style={MONO}>{fmt(subtotal, currency)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: C.muted }}>
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span style={MONO}>{fmt(taxAmount, currency)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: C.success }}>
                    <span>Discount</span>
                    <span style={MONO}>−{fmt(discount, currency)}</span>
                  </div>
                )}
                <div style={{ borderTop: `2px solid ${C.text}`, marginTop: 6, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800 }}>
                  <span>Total Due</span>
                  <span style={{ ...MONO, color: C.accent }}>{fmt(total, currency)}</span>
                </div>
              </div>
            </div>

            {/* ── Payment Instructions ── */}
            {hasPaymentData && (
              <>
                <Divider />
                <SectionLabel>Payment Instructions</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: hasBankData && (hasPaypalData || hasWiseData) ? '1fr 1fr' : '1fr', gap: 16 }}>
                  {hasBankData && (
                    <div style={{ background: C.bgLight, borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Bank Transfer</div>
                      {bank.bankName     && <Row label="Bank"    value={bank.bankName} />}
                      {bank.accountName  && <Row label="Name"    value={bank.accountName} />}
                      {bank.accountNumber && <Row label="Account" value={bank.accountNumber} mono />}
                      {bank.iban         && <Row label="IBAN"    value={bank.iban} mono />}
                      {bank.swift        && <Row label="SWIFT"   value={bank.swift} mono />}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {hasPaypalData && (
                      <div style={{ background: C.bgLight, borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>PayPal</div>
                        <Row label="Email" value={paypal.email} />
                      </div>
                    )}
                    {hasWiseData && (
                      <div style={{ background: C.bgLight, borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Wise</div>
                        <Row label="Email" value={wise.email} />
                        {wise.currency && <Row label="Currency" value={wise.currency} mono />}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Terms ── */}
            {invoice.terms && (
              <>
                <Divider />
                <SectionLabel>Terms & Conditions</SectionLabel>
                <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                  {invoice.terms}
                </p>
              </>
            )}

            {/* ── Notes ── */}
            {invoice.notes && (
              <>
                <Divider />
                <SectionLabel>Notes</SectionLabel>
                <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                  {invoice.notes}
                </p>
              </>
            )}

            {/* ── Signature ── */}
            <Divider />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ borderTop: `1px solid ${C.text}`, paddingTop: 6, marginTop: 32 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.04em' }}>
                    Authorized Signature
                  </div>
                  {invoice.signatureName && (
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginTop: 3 }}>
                      {invoice.signatureName}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 32 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.04em' }}>Client Acceptance</div>
                </div>
              </div>

              {/* Digital seal — stamped over the authorized signature line */}
              <div style={{
                position: 'absolute',
                bottom: -10,
                left: 130,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 2,
              }}>
                <DigitalSeal />
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 9, color: C.muted, letterSpacing: '0.04em' }}>
              Generated by Aeitron AI · {invoice.invoiceNumber || 'INV-0001'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: 11, marginBottom: 3 }}>
      <span style={{ color: '#8c90a0', minWidth: 56 }}>{label}:</span>
      <span style={{ color: '#1a1d26', fontWeight: 500, ...(mono ? MONO : {}) }}>{value}</span>
    </div>
  );
}
