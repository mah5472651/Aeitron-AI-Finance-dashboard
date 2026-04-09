import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, Building2, CreditCard, Wallet, Info, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useInvoices } from '../../context/InvoiceContext';
import { useClients } from '../../context/ClientContext';
import { useInvoicePresets } from '../../context/InvoicePresetsContext';
import { INVOICE_STATUSES, INVOICE_STATUS_COLORS, CURRENCIES, BILL_FROM_DEFAULTS } from '../../utils/constants';
import { formatCurrencyByCode } from '../../utils/formatters';
import InvoicePreview from './InvoicePreview';

function generateInvoiceNumber(invoices) {
  const num = invoices.length + 1;
  return `INV-${String(num).padStart(4, '0')}`;
}

function newLineItem() {
  return { _id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: '' };
}

function calcLineTotal(item) {
  return (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
}

const defaultPaymentInstructions = () => ({
  bank:   { bankName: '', accountName: '', accountNumber: '', iban: '', swift: '' },
  paypal: { email: '' },
  wise:   { email: '', currency: 'USD' },
});

function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (hasError = false) =>
  `w-full px-3 py-2.5 bg-bg border rounded-lg text-text text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors duration-200 ${
    hasError ? 'border-danger' : 'border-border'
  }`;

// ── Account type label helpers ───────────────────────────────
const ACCOUNT_TYPE_LABELS = {
  bank: 'Bank Transfer',
  payoneer: 'Payoneer',
  paypal: 'PayPal',
  wise: 'Wise',
};

function accountTypeIcon(type) {
  if (type === 'bank') return <Building2 size={11} />;
  return <Wallet size={11} />;
}

function blankNewAccount() {
  return {
    type: 'bank',
    label: '',
    bankName: '', accountName: '', accountNumber: '', iban: '', swift: '',
    email: '', currency: 'USD',
  };
}

export default function InvoiceForm({ isOpen, onClose, editInvoice }) {
  const { invoices, dispatch } = useInvoices();
  const { clients } = useClients();
  const { accounts, termsPresets, notesPresets, dispatch: presetsDispatch, addTermsPreset, addNotesPreset } = useInvoicePresets();

  const [form, setForm] = useState(() => buildDefault(invoices));
  const [errors, setErrors] = useState({});

  // ── Payment account UI state ─────────────────────────────
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState(blankNewAccount());
  const [addAccountError, setAddAccountError] = useState('');

  // ── Terms UI state ───────────────────────────────────────
  const [selectedTermsId, setSelectedTermsId] = useState('');
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [newTerm, setNewTerm] = useState({ title: '', content: '' });
  const [saveTermsAsPreset, setSaveTermsAsPreset] = useState(false);
  const [saveTermsTitle, setSaveTermsTitle] = useState('');
  const [newTermError, setNewTermError] = useState('');

  // ── Notes UI state ───────────────────────────────────────
  const [selectedNotesId, setSelectedNotesId] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [saveNotesAsPreset, setSaveNotesAsPreset] = useState(false);
  const [saveNotesTitle, setSaveNotesTitle] = useState('');
  const [newNoteError, setNewNoteError] = useState('');

  function buildDefault(invs) {
    const today = new Date().toISOString().split('T')[0];
    const due   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      clientId: '', clientName: '', companyName: '',
      invoiceNumber: generateInvoiceNumber(invs),
      issueDate: today, dueDate: due,
      status: 'Draft', currency: 'USD',
      lineItems: [newLineItem()],
      taxRate: '', discount: '',
      paymentInstructions: defaultPaymentInstructions(),
      billFrom: { ...BILL_FROM_DEFAULTS },
      terms: '', signatureName: '', notes: '',
    };
  }

  useEffect(() => {
    if (!isOpen) return;
    if (editInvoice) {
      setForm({
        clientId: editInvoice.clientId || '',
        clientName: editInvoice.clientName || '',
        companyName: editInvoice.companyName || '',
        invoiceNumber: editInvoice.invoiceNumber || '',
        issueDate: editInvoice.issueDate || '',
        dueDate: editInvoice.dueDate || '',
        status: editInvoice.status || 'Draft',
        currency: editInvoice.currency || 'USD',
        lineItems: editInvoice.lineItems?.length
          ? editInvoice.lineItems.map(i => ({ ...i, _id: i._id || crypto.randomUUID() }))
          : [newLineItem()],
        taxRate: editInvoice.taxRate ?? '',
        discount: editInvoice.discount ?? '',
        paymentInstructions: {
          bank:   { ...defaultPaymentInstructions().bank,   ...(editInvoice.paymentInstructions?.bank   || {}) },
          paypal: { ...defaultPaymentInstructions().paypal, ...(editInvoice.paymentInstructions?.paypal || {}) },
          wise:   { ...defaultPaymentInstructions().wise,   ...(editInvoice.paymentInstructions?.wise   || {}) },
        },
        billFrom: { ...BILL_FROM_DEFAULTS, ...(editInvoice.billFrom || {}) },
        terms: editInvoice.terms || '',
        signatureName: editInvoice.signatureName || '',
        notes: editInvoice.notes || '',
      });
    } else {
      setForm(buildDefault(invoices));
    }
    setErrors({});
    setSelectedAccountId('');
    setShowAddAccount(false);
    setNewAccount(blankNewAccount());
    setAddAccountError('');
    setSelectedTermsId('');
    setShowAddTerm(false);
    setNewTerm({ title: '', content: '' });
    setSaveTermsAsPreset(false);
    setSaveTermsTitle('');
    setNewTermError('');
    setSelectedNotesId('');
    setShowAddNote(false);
    setNewNote({ title: '', content: '' });
    setSaveNotesAsPreset(false);
    setSaveNotesTitle('');
    setNewNoteError('');
  }, [editInvoice, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  // ── Derived calculations ────────────────────────────────────
  const subtotal  = form.lineItems.reduce((s, i) => s + calcLineTotal(i), 0);
  const taxRate   = Math.min(100, Math.max(0, parseFloat(form.taxRate)  || 0));
  const discount  = Math.max(0, parseFloat(form.discount) || 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total     = Math.max(0, subtotal + taxAmount - discount);

  const previewData = { ...form, subtotal, taxAmount, total, taxRate, discount };
  const currencySymbol = CURRENCIES.find(c => c.code === form.currency)?.symbol || '$';

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function setPI(tab, field, value) {
    setForm(p => ({
      ...p,
      paymentInstructions: {
        ...p.paymentInstructions,
        [tab]: { ...p.paymentInstructions[tab], [field]: value },
      },
    }));
  }

  function setBillFrom(field, value) {
    setForm(p => ({ ...p, billFrom: { ...p.billFrom, [field]: value } }));
  }

  function handleClientSelect(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setForm(p => ({ ...p, clientId: client.id, clientName: client.clientName, companyName: client.companyName }));
    } else {
      setForm(p => ({ ...p, clientId: '', clientName: '', companyName: '' }));
    }
  }

  function handleLineItemChange(id, field, value) {
    setForm(p => ({
      ...p,
      lineItems: p.lineItems.map(item => item._id === id ? { ...item, [field]: value } : item),
    }));
  }

  function addLineItem() {
    setForm(p => ({ ...p, lineItems: [...p.lineItems, newLineItem()] }));
  }

  function removeLineItem(id) {
    setForm(p => ({
      ...p,
      lineItems: p.lineItems.length > 1 ? p.lineItems.filter(i => i._id !== id) : p.lineItems,
    }));
  }

  // ── Payment preset logic ─────────────────────────────────
  function applyPreset(accountId) {
    setSelectedAccountId(accountId);
    if (!accountId) return;
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    setForm(p => ({
      ...p,
      paymentInstructions: {
        bank: {
          bankName: account.type === 'bank' ? (account.bankName || '') : '',
          accountName: account.accountName || '',
          accountNumber: account.accountNumber || '',
          iban: account.iban || '',
          swift: account.swift || '',
        },
        paypal: { email: account.type === 'paypal' ? (account.email || '') : '' },
        wise: {
          email: account.type === 'wise' ? (account.email || '') : '',
          currency: account.currency || 'USD',
        },
      },
    }));
  }

  function handleSaveAccount() {
    if (!newAccount.label.trim()) {
      setAddAccountError('Label is required (e.g. "DBBL – Mahmud Hasan")');
      return;
    }
    const id = crypto.randomUUID();
    presetsDispatch({ type: 'ADD_ACCOUNT', payload: { id, ...newAccount, label: newAccount.label.trim() } });
    setShowAddAccount(false);
    setNewAccount(blankNewAccount());
    setAddAccountError('');
    // Auto-select the newly added account
    applyPreset(id);
    // Need to apply after dispatch lands — use a small trick: set directly
    setSelectedAccountId(id);
  }

  function setNA(field, value) {
    setNewAccount(p => ({ ...p, [field]: value }));
  }

  // ── Terms preset logic ───────────────────────────────────
  function loadTermsPreset(id) {
    setSelectedTermsId(id);
    if (!id) return;
    const preset = termsPresets.find(t => t.id === id);
    if (preset) set('terms', preset.content);
  }

  function handleSaveTermsPreset() {
    if (!saveTermsTitle.trim()) return;
    addTermsPreset(saveTermsTitle, form.terms);
    setSaveTermsAsPreset(false);
    setSaveTermsTitle('');
  }

  function handleSaveTerm() {
    if (!newTerm.title.trim()) { setNewTermError('Title is required'); return; }
    if (!newTerm.content.trim()) { setNewTermError('Content is required'); return; }
    addTermsPreset(newTerm.title, newTerm.content);
    setShowAddTerm(false);
    setNewTerm({ title: '', content: '' });
    setNewTermError('');
  }

  // ── Notes preset logic ───────────────────────────────────
  function loadNotesPreset(id) {
    setSelectedNotesId(id);
    if (!id) return;
    const preset = notesPresets.find(t => t.id === id);
    if (preset) set('notes', preset.content);
  }

  function handleSaveNotesPreset() {
    if (!saveNotesTitle.trim()) return;
    addNotesPreset(saveNotesTitle, form.notes);
    setSaveNotesAsPreset(false);
    setSaveNotesTitle('');
  }

  function handleSaveNote() {
    if (!newNote.title.trim()) { setNewNoteError('Title is required'); return; }
    if (!newNote.content.trim()) { setNewNoteError('Content is required'); return; }
    addNotesPreset(newNote.title, newNote.content);
    setShowAddNote(false);
    setNewNote({ title: '', content: '' });
    setNewNoteError('');
  }

  // ── Validation & Submit ──────────────────────────────────
  function validate() {
    const errs = {};
    if (!form.clientId) errs.clientId = 'Select a client';
    if (!form.invoiceNumber.trim()) errs.invoiceNumber = 'Required';
    if (!form.issueDate) errs.issueDate = 'Required';
    if (!form.dueDate) errs.dueDate = 'Required';
    const valid = form.lineItems.filter(i => i.description.trim() && parseFloat(i.unitPrice) > 0);
    if (valid.length === 0) errs.lineItems = 'Add at least one line item with a description and price';
    if (form.taxRate !== '' && (isNaN(parseFloat(form.taxRate)) || parseFloat(form.taxRate) < 0 || parseFloat(form.taxRate) > 100)) {
      errs.taxRate = 'Must be 0–100';
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const now = new Date().toISOString();
    const lineItems = form.lineItems
      .filter(i => i.description.trim())
      .map(({ _id, ...rest }) => ({
        description: rest.description.trim(),
        quantity: parseFloat(rest.quantity) || 1,
        unitPrice: parseFloat(rest.unitPrice) || 0,
        total: calcLineTotal(rest),
      }));

    const invoiceData = {
      clientId: form.clientId,
      clientName: form.clientName,
      companyName: form.companyName,
      invoiceNumber: form.invoiceNumber.trim(),
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      status: form.status,
      currency: form.currency,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      paymentInstructions: form.paymentInstructions,
      billFrom: form.billFrom,
      terms: form.terms.trim(),
      signatureName: form.signatureName.trim(),
      notes: form.notes.trim(),
    };

    if (editInvoice) {
      dispatch({ type: 'UPDATE_INVOICE', payload: { id: editInvoice.id, ...invoiceData, updatedAt: now } });
    } else {
      dispatch({ type: 'ADD_INVOICE', payload: { id: crypto.randomUUID(), ...invoiceData, createdAt: now, updatedAt: now } });
    }
    onClose();
  }

  // ── Render helpers ───────────────────────────────────────
  const isCustom = !selectedAccountId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-bg-card border border-border rounded-2xl w-full max-w-[1380px] h-[93vh] flex flex-col overflow-hidden animate-fade-in shadow-modal">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <CreditCard size={15} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">
                {editInvoice ? 'Edit Invoice' : 'Create Invoice'}
              </h2>
              <p className="text-xs text-text-muted font-mono">{form.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text hover:bg-bg-hover rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Split Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ══ LEFT: Form ═══════════════════════════════════ */}
          <form onSubmit={handleSubmit} className="w-[58%] h-full overflow-y-auto border-r border-border">
            <div className="p-6 space-y-7">

              {/* §1 INVOICE DETAILS */}
              <div>
                <SectionHeader label="Invoice Details" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Invoice Number" error={errors.invoiceNumber}>
                    <input
                      type="text"
                      value={form.invoiceNumber}
                      onChange={e => set('invoiceNumber', e.target.value)}
                      className={`${inputCls(!!errors.invoiceNumber)} font-mono`}
                    />
                  </Field>
                  <Field label="Currency">
                    <select value={form.currency} onChange={e => set('currency', e.target.value)} className={inputCls()}>
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Issue Date" error={errors.issueDate}>
                    <input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} className={inputCls(!!errors.issueDate)} />
                  </Field>
                  <Field label="Due Date" error={errors.dueDate}>
                    <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className={inputCls(!!errors.dueDate)} />
                  </Field>
                </div>

                {/* Status pills */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {INVOICE_STATUSES.map(s => (
                      <button
                        key={s} type="button"
                        onClick={() => set('status', s)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-150 ${
                          form.status === s
                            ? `${INVOICE_STATUS_COLORS[s]} border-current`
                            : 'bg-transparent text-text-muted border-border hover:border-text-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* §2 PARTIES */}
              <div>
                <SectionHeader label="Parties" />
                <div className="grid grid-cols-2 gap-6">
                  {/* Bill To */}
                  <div>
                    <p className="text-xs font-semibold text-accent mb-3 flex items-center gap-1.5">
                      <Building2 size={12} /> Bill To
                    </p>
                    <Field label="Client" error={errors.clientId}>
                      <select
                        value={form.clientId}
                        onChange={e => handleClientSelect(e.target.value)}
                        className={inputCls(!!errors.clientId)}
                      >
                        <option value="">Select client…</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.clientName} — {c.companyName}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  {/* Bill From */}
                  <div>
                    <p className="text-xs font-semibold text-accent mb-3 flex items-center gap-1.5">
                      <Building2 size={12} /> Bill From (Aeitron)
                    </p>
                    <div className="space-y-2.5">
                      <input type="text" placeholder="Company name" value={form.billFrom.name}
                        onChange={e => setBillFrom('name', e.target.value)} className={inputCls()} />
                      <input type="text" placeholder="Address" value={form.billFrom.address}
                        onChange={e => setBillFrom('address', e.target.value)} className={inputCls()} />
                      <input type="text" placeholder="City, Country" value={form.billFrom.city}
                        onChange={e => setBillFrom('city', e.target.value)} className={inputCls()} />
                      <input type="text" placeholder="Tax / Business ID" value={form.billFrom.taxId}
                        onChange={e => setBillFrom('taxId', e.target.value)} className={`${inputCls()} font-mono`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* §3 LINE ITEMS */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Line Items</span>
                    <div className="flex-1 h-px bg-border w-8" />
                  </div>
                  <button
                    type="button" onClick={addLineItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/15 rounded-lg transition-colors"
                  >
                    <Plus size={12} /> Add Row
                  </button>
                </div>

                {errors.lineItems && (
                  <div className="flex items-center gap-2 p-2.5 bg-danger/10 border border-danger/20 rounded-lg mb-3">
                    <Info size={12} className="text-danger shrink-0" />
                    <p className="text-xs text-danger">{errors.lineItems}</p>
                  </div>
                )}

                {/* Column headers */}
                <div className="grid gap-2 mb-1.5 px-1" style={{ gridTemplateColumns: '1fr 64px 100px 88px 32px' }}>
                  {['Description', 'Qty', 'Unit Price', 'Total', ''].map(h => (
                    <span key={h} className="text-xs font-medium text-text-muted">{h}</span>
                  ))}
                </div>

                <AnimatePresence initial={false}>
                  {form.lineItems.map(item => {
                    const lineTotal = calcLineTotal(item);
                    return (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="grid gap-2 mb-2 items-center" style={{ gridTemplateColumns: '1fr 64px 100px 88px 32px' }}>
                          <input
                            type="text" placeholder="Service description…"
                            value={item.description}
                            onChange={e => handleLineItemChange(item._id, 'description', e.target.value)}
                            className="px-2.5 py-2 bg-bg border border-border rounded-lg text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                          />
                          <input
                            type="number" min="0.01" step="0.01" placeholder="1"
                            value={item.quantity}
                            onChange={e => handleLineItemChange(item._id, 'quantity', e.target.value)}
                            className="px-2 py-2 bg-bg border border-border rounded-lg text-sm text-text font-mono text-right outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                          />
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono">
                              {currencySymbol}
                            </span>
                            <input
                              type="number" min="0" step="0.01" placeholder="0.00"
                              value={item.unitPrice}
                              onChange={e => handleLineItemChange(item._id, 'unitPrice', e.target.value)}
                              className="w-full pl-6 pr-2 py-2 bg-bg border border-border rounded-lg text-sm text-text font-mono text-right outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                            />
                          </div>
                          <div className="text-sm font-semibold text-text font-mono text-right tabular-nums">
                            {currencySymbol}{lineTotal.toFixed(2)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLineItem(item._id)}
                            disabled={form.lineItems.length === 1}
                            className="p-1.5 text-text-muted hover:text-danger rounded-lg transition-colors disabled:opacity-20"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* §4 CALCULATIONS */}
              <div>
                <SectionHeader label="Calculations" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label={`Tax Rate (%)`} error={errors.taxRate}>
                    <div className="relative">
                      <input
                        type="number" min="0" max="100" step="0.1" placeholder="0"
                        value={form.taxRate}
                        onChange={e => set('taxRate', e.target.value)}
                        className={`${inputCls(!!errors.taxRate)} font-mono pr-8`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">%</span>
                    </div>
                  </Field>
                  <Field label={`Discount (${currencySymbol})`}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono">{currencySymbol}</span>
                      <input
                        type="number" min="0" step="0.01" placeholder="0.00"
                        value={form.discount}
                        onChange={e => set('discount', e.target.value)}
                        className={`${inputCls()} font-mono pl-7`}
                      />
                    </div>
                  </Field>
                </div>

                {/* Totals summary */}
                <div className="bg-bg rounded-xl border border-border p-4 space-y-2">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{formatCurrencyByCode(subtotal, form.currency)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-sm text-text-muted">
                      <span>Tax ({taxRate}%)</span>
                      <span className="font-mono tabular-nums">+{formatCurrencyByCode(taxAmount, form.currency)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span className="font-mono tabular-nums">−{formatCurrencyByCode(discount, form.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-sm font-semibold text-text">Total Due</span>
                    <span className="text-xl font-bold text-accent font-mono tabular-nums">
                      {formatCurrencyByCode(total, form.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* §5 PAYMENT INSTRUCTIONS ── Payment Vault */}
              <div>
                <SectionHeader label="Payment Instructions" />

                {/* Account dropdown */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                    Select Payment Account
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={e => applyPreset(e.target.value)}
                    className={inputCls()}
                  >
                    <option value="">— Custom / Manual Entry —</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.label} ({ACCOUNT_TYPE_LABELS[a.type] || a.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-text-muted mt-1">
                    {selectedAccountId
                      ? 'Fields pre-filled from saved account. Edit below if needed.'
                      : 'Choose a saved account to auto-fill, or enter manually below.'}
                  </p>
                </div>

                {/* Manual fields — always visible, editable */}
                <div className="bg-bg rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={12} className="text-text-muted" />
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Bank Transfer Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Bank Name">
                      <input type="text" placeholder="e.g. Dutch Bangla Bank" value={form.paymentInstructions.bank.bankName}
                        onChange={e => setPI('bank', 'bankName', e.target.value)} className={inputCls()} />
                    </Field>
                    <Field label="Account Name">
                      <input type="text" placeholder="Legal account holder name" value={form.paymentInstructions.bank.accountName}
                        onChange={e => setPI('bank', 'accountName', e.target.value)} className={inputCls()} />
                    </Field>
                    <Field label="Account Number">
                      <input type="text" placeholder="00000000" value={form.paymentInstructions.bank.accountNumber}
                        onChange={e => setPI('bank', 'accountNumber', e.target.value)} className={`${inputCls()} font-mono`} />
                    </Field>
                    <Field label="SWIFT / BIC">
                      <input type="text" placeholder="e.g. DBBLBDDH" value={form.paymentInstructions.bank.swift}
                        onChange={e => setPI('bank', 'swift', e.target.value)} className={`${inputCls()} font-mono uppercase`} />
                    </Field>
                  </div>
                  <Field label="IBAN (optional)">
                    <input type="text" placeholder="e.g. GB29 NWBK 6016 1331 9268 19" value={form.paymentInstructions.bank.iban}
                      onChange={e => setPI('bank', 'iban', e.target.value)} className={`${inputCls()} font-mono uppercase`} />
                  </Field>

                  {/* PayPal / Wise optional extras */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border mt-2">
                    <Field label="PayPal Email (optional)">
                      <input type="email" placeholder="paypal@example.com" value={form.paymentInstructions.paypal.email}
                        onChange={e => setPI('paypal', 'email', e.target.value)} className={inputCls()} />
                    </Field>
                    <Field label="Wise Email (optional)">
                      <input type="email" placeholder="wise@example.com" value={form.paymentInstructions.wise.email}
                        onChange={e => setPI('wise', 'email', e.target.value)} className={inputCls()} />
                    </Field>
                  </div>
                </div>

                {/* Add New Account panel */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddAccount(p => !p); setAddAccountError(''); }}
                    className="flex items-center gap-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    {showAddAccount ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {showAddAccount ? 'Cancel' : '+ Add New Payment Account'}
                  </button>

                  <AnimatePresence initial={false}>
                    {showAddAccount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="mt-3 p-4 bg-bg rounded-xl border border-accent/20">
                          <p className="text-xs font-semibold text-text mb-3">New Payment Account</p>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <Field label="Account Type">
                              <select value={newAccount.type} onChange={e => setNA('type', e.target.value)} className={inputCls()}>
                                <option value="bank">Bank Transfer</option>
                                <option value="payoneer">Payoneer</option>
                                <option value="paypal">PayPal</option>
                                <option value="wise">Wise</option>
                              </select>
                            </Field>
                            <Field label="Display Label">
                              <input type="text" placeholder='e.g. "DBBL – Mahmud Hasan"'
                                value={newAccount.label} onChange={e => setNA('label', e.target.value)} className={inputCls()} />
                            </Field>
                          </div>

                          {/* Fields per type */}
                          {newAccount.type === 'bank' && (
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Bank Name">
                                <input type="text" placeholder="Dutch Bangla Bank"
                                  value={newAccount.bankName} onChange={e => setNA('bankName', e.target.value)} className={inputCls()} />
                              </Field>
                              <Field label="Account Name">
                                <input type="text" placeholder="Full legal name"
                                  value={newAccount.accountName} onChange={e => setNA('accountName', e.target.value)} className={inputCls()} />
                              </Field>
                              <Field label="Account Number">
                                <input type="text" placeholder="1271070570700"
                                  value={newAccount.accountNumber} onChange={e => setNA('accountNumber', e.target.value)} className={`${inputCls()} font-mono`} />
                              </Field>
                              <Field label="SWIFT / BIC">
                                <input type="text" placeholder="DBBLBDDH"
                                  value={newAccount.swift} onChange={e => setNA('swift', e.target.value.toUpperCase())} className={`${inputCls()} font-mono uppercase`} />
                              </Field>
                              <Field label="IBAN (optional)">
                                <input type="text" placeholder="optional"
                                  value={newAccount.iban} onChange={e => setNA('iban', e.target.value)} className={`${inputCls()} font-mono uppercase`} />
                              </Field>
                            </div>
                          )}
                          {(newAccount.type === 'payoneer' || newAccount.type === 'paypal' || newAccount.type === 'wise') && (
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Email">
                                <input type="email" placeholder="account@example.com"
                                  value={newAccount.email} onChange={e => setNA('email', e.target.value)} className={inputCls()} />
                              </Field>
                              {newAccount.type === 'payoneer' && (
                                <Field label="Account Name">
                                  <input type="text" placeholder="Full name"
                                    value={newAccount.accountName} onChange={e => setNA('accountName', e.target.value)} className={inputCls()} />
                                </Field>
                              )}
                              {newAccount.type === 'wise' && (
                                <Field label="Currency">
                                  <select value={newAccount.currency} onChange={e => setNA('currency', e.target.value)} className={inputCls()}>
                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                  </select>
                                </Field>
                              )}
                            </div>
                          )}

                          {addAccountError && (
                            <p className="text-xs text-danger mt-2">{addAccountError}</p>
                          )}

                          <button
                            type="button"
                            onClick={handleSaveAccount}
                            className="mt-3 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
                          >
                            <Save size={12} /> Save Account
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* §6 TERMS & CONDITIONS */}
              <div>
                <SectionHeader label="Terms & Conditions" />

                {/* Preset selector */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm shrink-0" title="Terms presets">⚖️</span>
                  <select
                    value={selectedTermsId}
                    onChange={e => loadTermsPreset(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-text outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Select a terms preset…</option>
                    {termsPresets.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Payment due within 14 days. Late payments subject to a 2% monthly fee…"
                    value={form.terms}
                    onChange={e => { set('terms', e.target.value); setSelectedTermsId(''); }}
                    className={`${inputCls()} resize-none`}
                  />
                  <span className={`absolute bottom-2 right-3 text-xs tabular-nums ${form.terms.length > 450 ? 'text-warning' : 'text-text-muted'}`}>
                    {form.terms.length}/500
                  </span>
                </div>

                {/* Save as Preset checkbox */}
                {form.terms.trim() && (
                  <div className="mt-2 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveTermsAsPreset}
                        onChange={e => { setSaveTermsAsPreset(e.target.checked); setSaveTermsTitle(''); }}
                        className="rounded border-border accent-accent"
                      />
                      <span className="text-xs text-text-muted">Save as Preset</span>
                    </label>
                    <AnimatePresence initial={false}>
                      {saveTermsAsPreset && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Preset title (e.g. Standard 15 Days)"
                              value={saveTermsTitle}
                              onChange={e => setSaveTermsTitle(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-text outline-none focus:border-accent transition-colors"
                            />
                            <button
                              type="button"
                              onClick={handleSaveTermsPreset}
                              disabled={!saveTermsTitle.trim()}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 disabled:opacity-40 rounded-lg transition-colors"
                            >
                              <Save size={11} /> Save
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Add New Term panel */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddTerm(p => !p); setNewTerm({ title: '', content: '' }); setNewTermError(''); }}
                    className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    {showAddTerm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showAddTerm ? 'Cancel' : '+ Add New Term'}
                  </button>
                  <AnimatePresence initial={false}>
                    {showAddTerm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="mt-2 p-3 bg-bg rounded-xl border border-accent/20 space-y-2">
                          <input
                            type="text"
                            placeholder="Title (e.g. Standard 15 Days)"
                            value={newTerm.title}
                            onChange={e => setNewTerm(p => ({ ...p, title: e.target.value }))}
                            className={inputCls()}
                          />
                          <textarea
                            rows={3}
                            placeholder="Terms content…"
                            value={newTerm.content}
                            onChange={e => setNewTerm(p => ({ ...p, content: e.target.value }))}
                            className={`${inputCls()} resize-none`}
                          />
                          {newTermError && <p className="text-xs text-danger">{newTermError}</p>}
                          <button
                            type="button"
                            onClick={handleSaveTerm}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
                          >
                            <Save size={11} /> Save Term
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* §7 SIGNATURE */}
              <div>
                <SectionHeader label="Signature" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Authorized Signatory Name">
                    <input
                      type="text" placeholder="Full name"
                      value={form.signatureName}
                      onChange={e => set('signatureName', e.target.value)}
                      className={inputCls()}
                    />
                  </Field>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Signature Placeholder</label>
                    <div className="h-[42px] border border-dashed border-border rounded-lg flex items-end px-3 pb-1.5">
                      <div className="w-full border-b border-text-muted/30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* §8 NOTES (internal) */}
              <div>
                <SectionHeader label="Internal Notes" />

                {/* Preset selector */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm shrink-0" title="Notes presets">📝</span>
                  <select
                    value={selectedNotesId}
                    onChange={e => loadNotesPreset(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-text outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Select a notes preset…</option>
                    {notesPresets.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={2}
                  placeholder="Internal notes (not shown on invoice)…"
                  value={form.notes}
                  onChange={e => { set('notes', e.target.value); setSelectedNotesId(''); }}
                  className={`${inputCls()} resize-none`}
                />

                {/* Save as Preset checkbox */}
                {form.notes.trim() && (
                  <div className="mt-2 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveNotesAsPreset}
                        onChange={e => { setSaveNotesAsPreset(e.target.checked); setSaveNotesTitle(''); }}
                        className="rounded border-border accent-accent"
                      />
                      <span className="text-xs text-text-muted">Save as Preset</span>
                    </label>
                    <AnimatePresence initial={false}>
                      {saveNotesAsPreset && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Preset title (e.g. Project Milestone)"
                              value={saveNotesTitle}
                              onChange={e => setSaveNotesTitle(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-text outline-none focus:border-accent transition-colors"
                            />
                            <button
                              type="button"
                              onClick={handleSaveNotesPreset}
                              disabled={!saveNotesTitle.trim()}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 disabled:opacity-40 rounded-lg transition-colors"
                            >
                              <Save size={11} /> Save
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Add New Note panel */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddNote(p => !p); setNewNote({ title: '', content: '' }); setNewNoteError(''); }}
                    className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    {showAddNote ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showAddNote ? 'Cancel' : '+ Add New Note'}
                  </button>
                  <AnimatePresence initial={false}>
                    {showAddNote && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="mt-2 p-3 bg-bg rounded-xl border border-accent/20 space-y-2">
                          <input
                            type="text"
                            placeholder="Title (e.g. Project Milestone)"
                            value={newNote.title}
                            onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))}
                            className={inputCls()}
                          />
                          <textarea
                            rows={3}
                            placeholder="Note content…"
                            value={newNote.content}
                            onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))}
                            className={`${inputCls()} resize-none`}
                          />
                          {newNoteError && <p className="text-xs text-danger">{newNoteError}</p>}
                          <button
                            type="button"
                            onClick={handleSaveNote}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
                          >
                            <Save size={11} /> Save Note
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Footer Actions ── */}
              <div className="flex justify-between items-center pt-2 pb-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text border border-border rounded-lg hover:bg-bg-hover transition-all duration-200">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                  {editInvoice ? 'Save Changes' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </form>

          {/* ══ RIGHT: Live Preview ════════════════════════════ */}
          <div className="w-[42%] h-full overflow-y-auto bg-bg p-5">
            <InvoicePreview invoice={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
