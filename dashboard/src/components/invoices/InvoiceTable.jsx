import { useState, useMemo } from 'react';
import { FileText, Search, Eye, Edit3, Trash2 } from 'lucide-react';
import { useInvoices } from '../../context/InvoiceContext';
import { INVOICE_STATUSES, INVOICE_STATUS_COLORS } from '../../utils/constants';
import { formatCurrency, formatCurrencyByCode, formatDate } from '../../utils/formatters';

export default function InvoiceTable({ onEdit, onView, onRequestDelete, globalSearch = '' }) {
  const { invoices, dispatch } = useInvoices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let result = invoices;

    const combinedSearch = (globalSearch || search).toLowerCase();
    if (combinedSearch) {
      result = result.filter(
        (inv) =>
          (inv.invoiceNumber || '').toLowerCase().includes(combinedSearch) ||
          (inv.clientName   || '').toLowerCase().includes(combinedSearch) ||
          (inv.companyName  || '').toLowerCase().includes(combinedSearch)
      );
    }

    if (statusFilter) {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, search, globalSearch, statusFilter, sortField, sortDir]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleDelete(invoice) {
    if (onRequestDelete) {
      onRequestDelete(
        () => dispatch({ type: 'DELETE_INVOICE', payload: invoice.id }),
        `Invoice ${invoice.invoiceNumber}`
      );
    }
  }

  const summaryStats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.filter((inv) => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);
    const outstanding = invoices
      .filter((inv) => inv.status === 'Sent' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdue = invoices.filter((inv) => inv.status === 'Overdue').length;
    return { total, paid, outstanding, overdue };
  }, [invoices]);

  const SortHeader = ({ field, children, className = '' }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text transition-colors select-none ${className}`}
    >
      {children}
      {sortField === field && (
        <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
      )}
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total Invoiced" value={formatCurrency(summaryStats.total)} color="text-text" />
        <SummaryCard label="Paid" value={formatCurrency(summaryStats.paid)} color="text-success" />
        <SummaryCard label="Outstanding" value={formatCurrency(summaryStats.outstanding)} color="text-warning" />
        <SummaryCard label="Overdue" value={summaryStats.overdue} color="text-danger" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border rounded-lg flex-1">
          <Search size={15} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-text placeholder:text-text-muted/50 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text outline-none"
        >
          <option value="">All Statuses</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <FileText size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {invoices.length === 0 ? 'No invoices yet' : 'No matching invoices'}
            </p>
            <p className="text-xs mt-1 opacity-60">
              {invoices.length === 0
                ? 'Create your first invoice to get started'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <SortHeader field="invoiceNumber">Invoice</SortHeader>
                  <SortHeader field="clientName">Client</SortHeader>
                  <SortHeader field="status">Status</SortHeader>
                  <SortHeader field="issueDate" className="hidden md:table-cell">Issued</SortHeader>
                  <SortHeader field="dueDate" className="hidden md:table-cell">Due</SortHeader>
                  <SortHeader field="total">Amount</SortHeader>
                  <th className="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border-light hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-accent">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-text">{invoice.clientName || 'Valued Client'}</p>
                        <p className="text-xs text-text-muted">{invoice.companyName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted hidden md:table-cell">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted hidden md:table-cell">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-text font-mono">{formatCurrencyByCode(invoice.total, invoice.currency ?? 'USD')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(invoice)}
                            className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-bg-hover transition-colors"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(invoice)}
                            className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-bg-hover transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="p-1.5 text-text-muted hover:text-danger rounded-md hover:bg-bg-hover transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
