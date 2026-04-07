import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useLeads } from '../../context/LeadsContext';
import { useInvoices } from '../../context/InvoiceContext';
import { useSystemHealth } from '../../context/SystemHealthContext';
import { useApiCredits } from '../../context/ApiCreditsContext';
import { exportToCsv, CLIENT_COLUMNS, EXPENSE_COLUMNS, INVOICE_COLUMNS, LEAD_COLUMNS } from '../../utils/exportCsv';

export default function DownloadReportButton() {
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { leads } = useLeads();
  const { invoices } = useInvoices();
  const { automations } = useSystemHealth();
  const { services } = useApiCredits();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function downloadJson() {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalClients: clients.length,
        totalLeads: leads.length,
        totalInvoices: invoices.length,
        totalAutomations: automations.length,
      },
      clients,
      expenses,
      leads,
      invoices,
      automations,
      apiCredits: services,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeitron-report-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  function downloadCsv(type) {
    const date = new Date().toISOString().split('T')[0];
    const map = {
      clients: { data: clients, columns: CLIENT_COLUMNS, name: 'clients' },
      expenses: { data: expenses, columns: EXPENSE_COLUMNS, name: 'expenses' },
      invoices: { data: invoices, columns: INVOICE_COLUMNS, name: 'invoices' },
      leads: { data: leads, columns: LEAD_COLUMNS, name: 'leads' },
    };
    const config = map[type];
    exportToCsv(`aeitron-${config.name}-${date}.csv`, config.columns, config.data);
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-muted hover:text-text border border-border rounded-lg hover:bg-bg-hover transition-all duration-200"
        title="Download Report"
      >
        <Download size={16} />
        <span className="hidden md:inline">Report</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-bg-card border border-border rounded-xl shadow-modal py-1 z-50 animate-fade-in">
          <button onClick={downloadJson} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg-hover transition-colors">
            Full Report (JSON)
          </button>
          <div className="border-t border-border my-1" />
          <p className="px-4 py-1 text-xs text-text-muted font-medium">Export as CSV</p>
          <button onClick={() => downloadCsv('clients')} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg-hover transition-colors">
            Clients
          </button>
          <button onClick={() => downloadCsv('expenses')} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg-hover transition-colors">
            Expenses
          </button>
          <button onClick={() => downloadCsv('invoices')} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg-hover transition-colors">
            Invoices
          </button>
          <button onClick={() => downloadCsv('leads')} className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg-hover transition-colors">
            Leads
          </button>
        </div>
      )}
    </div>
  );
}
