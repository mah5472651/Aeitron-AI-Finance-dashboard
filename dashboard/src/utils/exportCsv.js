/**
 * Client-side CSV export utility.
 * Generates a CSV file and triggers browser download.
 */

export function exportToCsv(filename, columns, data) {
  const header = columns.map((c) => c.label).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        let val = row[c.key] ?? '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

// Pre-defined column configs
export const CLIENT_COLUMNS = [
  { key: 'clientName', label: 'Client Name' },
  { key: 'companyName', label: 'Company' },
  { key: 'serviceType', label: 'Service Type' },
  { key: 'onboardingStatus', label: 'Status' },
  { key: 'paymentCategory', label: 'Payment' },
  { key: 'totalProjectValue', label: 'Total Value' },
  { key: 'amountPaid', label: 'Amount Paid' },
];

export const EXPENSE_COLUMNS = [
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date' },
];

export const INVOICE_COLUMNS = [
  { key: 'invoiceNumber', label: 'Invoice #' },
  { key: 'clientName', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'issueDate', label: 'Issue Date' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'total', label: 'Total' },
];

export const LEAD_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'stage', label: 'Stage' },
  { key: 'dealValue', label: 'Deal Value' },
];
