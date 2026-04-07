import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useExpenses } from '../../context/ExpenseContext';
import { calcBurnRate } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export default function BurnRateCard() {
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { monthlyExpenses, monthlyRevenue, runwayMonths } = useMemo(
    () => calcBurnRate(clients, expenses),
    [clients, expenses]
  );

  const runway = runwayMonths === Infinity ? null : Math.round(runwayMonths * 10) / 10;
  const color = runway === null ? '#8c90a0' : runway > 6 ? '#10b981' : runway > 3 ? '#f59e0b' : '#ef4444';
  const label = runway === null ? 'N/A' : `${runway} mo`;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-muted font-medium">Burn Rate</span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Flame size={18} style={{ color }} />
        </div>
      </div>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color }}
      >
        {label}
      </p>
      <p className="text-xs text-text-muted mt-1">
        {runway !== null
          ? `${formatCurrency(monthlyExpenses)}/mo expenses vs ${formatCurrency(monthlyRevenue)}/mo revenue`
          : 'No expense data to calculate runway'}
      </p>
    </div>
  );
}
