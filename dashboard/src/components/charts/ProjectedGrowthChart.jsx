import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useLeads } from '../../context/LeadsContext';
import { calcProjectedRevenue } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export default function ProjectedGrowthChart() {
  const { clients } = useClients();
  const { leads } = useLeads();
  const data = useMemo(() => calcProjectedRevenue(clients, leads, 6), [clients, leads]);

  const hasData = clients.length > 0 || leads.length > 0;

  return (
    <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text mb-4">Projected Growth (6 Months)</h3>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-52 text-text-muted">
          <TrendingUp size={32} className="mb-2 opacity-40" />
          <p className="text-xs">Add clients or leads to see revenue projections</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="recurringGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ea" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#8c90a0', fontSize: 11 }}
              axisLine={{ stroke: '#e2e4ea' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8c90a0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e4ea',
                borderRadius: '8px',
                color: '#1a1d26',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value, name) => [
                formatCurrency(value),
                name === 'recurring' ? 'Recurring Revenue' : 'Pipeline Weighted',
              ]}
              labelStyle={{ color: '#8c90a0' }}
            />
            <Legend
              formatter={(value) => (value === 'recurring' ? 'Recurring (MRR)' : 'Pipeline Weighted')}
              wrapperStyle={{ fontSize: '11px', color: '#8c90a0' }}
            />
            <Area
              type="monotone"
              dataKey="recurring"
              stackId="1"
              stroke="#6c5ce7"
              strokeWidth={2}
              fill="url(#recurringGradient)"
            />
            <Area
              type="monotone"
              dataKey="pipeline"
              stackId="1"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#pipelineGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
