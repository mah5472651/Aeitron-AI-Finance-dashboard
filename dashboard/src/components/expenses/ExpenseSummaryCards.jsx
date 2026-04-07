import { useMemo } from 'react';
import { Receipt, RefreshCw, Calendar } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { calcTotalExpenses } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export default function ExpenseSummaryCards() {
  const { expenses } = useExpenses();

  const stats = useMemo(() => {
    const total = calcTotalExpenses(expenses);
    const recurringTotal = expenses
      .filter((e) => e.recurring)
      .reduce((sum, e) => sum + e.amount, 0);
    const monthCount = new Set(
      expenses.map((e) => {
        const d = new Date(e.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    ).size;
    const monthlyAvg = monthCount > 0 ? total / monthCount : 0;

    return [
      { label: 'Total Expenses', value: formatCurrency(total), icon: Receipt, color: '#ef4444' },
      { label: 'Recurring Monthly', value: formatCurrency(recurringTotal), icon: RefreshCw, color: '#8b5cf6' },
      { label: 'Monthly Average', value: formatCurrency(monthlyAvg), icon: Calendar, color: '#f59e0b' },
    ];
  }, [expenses]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            <stat.icon size={18} style={{ color: stat.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted font-medium truncate">{stat.label}</p>
            <p className="text-lg font-bold text-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
