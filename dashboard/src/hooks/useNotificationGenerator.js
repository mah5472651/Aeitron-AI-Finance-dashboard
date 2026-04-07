import { useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { useExpenses } from '../context/ExpenseContext';
import { useInvoices } from '../context/InvoiceContext';
import { useNotifications } from '../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

export default function useNotificationGenerator() {
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { invoices } = useInvoices();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Overdue payments: clients with outstanding balance and payment category "Unpaid"
    clients.forEach((client) => {
      const outstanding = client.totalProjectValue - client.amountPaid;
      if (client.paymentCategory === 'Unpaid' && outstanding > 0) {
        addNotification({
          type: NOTIFICATION_TYPES.OVERDUE_PAYMENT,
          title: `Overdue payment: ${client.clientName}`,
          message: `${formatCurrency(outstanding)} outstanding from ${client.companyName}`,
          dedupKey: `overdue-${client.id}`,
          clientId: client.id,
        });
      }
    });

    // Partially paid clients with high outstanding balance (>50% unpaid)
    clients.forEach((client) => {
      if (client.paymentCategory === 'Partially Paid 50%') {
        const outstanding = client.totalProjectValue - client.amountPaid;
        if (outstanding > client.totalProjectValue * 0.5) {
          addNotification({
            type: NOTIFICATION_TYPES.OVERDUE_PAYMENT,
            title: `Payment behind: ${client.clientName}`,
            message: `Only ${formatCurrency(client.amountPaid)} of ${formatCurrency(client.totalProjectValue)} paid`,
            dedupKey: `partial-${client.id}`,
            clientId: client.id,
          });
        }
      }
    });

    // Milestone alerts: projects with low completion but old creation date (>30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    clients.forEach((client) => {
      if (
        client.milestones < 50 &&
        client.onboardingStatus !== 'Prospect' &&
        new Date(client.createdAt).getTime() < thirtyDaysAgo
      ) {
        addNotification({
          type: NOTIFICATION_TYPES.MILESTONE_DUE,
          title: `Slow progress: ${client.clientName}`,
          message: `Only ${client.milestones}% complete after 30+ days`,
          dedupKey: `milestone-${client.id}`,
          clientId: client.id,
        });
      }
    });

    // Budget threshold: total expenses exceeding 80% of total revenue
    const totalRevenue = clients.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalRevenue > 0 && totalExpenses > totalRevenue * 0.8) {
      const pct = Math.round((totalExpenses / totalRevenue) * 100);
      addNotification({
        type: NOTIFICATION_TYPES.BUDGET_THRESHOLD,
        title: 'High expense ratio',
        message: `Expenses are ${pct}% of revenue (${formatCurrency(totalExpenses)} / ${formatCurrency(totalRevenue)})`,
        dedupKey: `budget-ratio-${pct}`,
      });
    }

    // Overdue invoices
    const now = new Date();
    invoices.forEach((inv) => {
      if (inv.status === 'Sent' && new Date(inv.dueDate) < now) {
        addNotification({
          type: NOTIFICATION_TYPES.INVOICE_OVERDUE,
          title: `Invoice #${inv.invoiceNumber} overdue`,
          message: `${formatCurrency(inv.total)} due from ${inv.clientName}`,
          dedupKey: `inv-overdue-${inv.id}`,
          invoiceId: inv.id,
        });
      }
    });
  }, [clients, expenses, invoices, addNotification]);
}
