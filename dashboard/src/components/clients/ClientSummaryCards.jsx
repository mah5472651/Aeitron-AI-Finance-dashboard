import { useMemo } from 'react';
import { Users, UserCheck, DollarSign, TrendingUp } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { calcTotalRevenue, calcOnboardedCount } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export default function ClientSummaryCards() {
  const { clients } = useClients();

  const stats = useMemo(() => {
    const totalValue = clients.reduce((sum, c) => sum + c.totalProjectValue, 0);
    const totalPaid = calcTotalRevenue(clients);
    const collectionRate = totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0;
    const onboarded = calcOnboardedCount(clients);

    return [
      { label: 'Total Clients', value: clients.length.toString(), icon: Users, color: '#4da6ff' },
      { label: 'Onboarded', value: `${onboarded} / ${clients.length}`, icon: UserCheck, color: '#10b981' },
      { label: 'Total Project Value', value: formatCurrency(totalValue), icon: DollarSign, color: '#8b5cf6' },
      { label: 'Collection Rate', value: `${collectionRate}%`, icon: TrendingUp, color: collectionRate >= 70 ? '#10b981' : '#f59e0b' },
    ];
  }, [clients]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
