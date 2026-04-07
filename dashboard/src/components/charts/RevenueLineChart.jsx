import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { calcRevenueOverTime } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export default function RevenueLineChart() {
  const { clients } = useClients();
  const data = useMemo(() => calcRevenueOverTime(clients), [clients]);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text mb-4">Revenue Growth</h3>

      {data.length < 2 ? (
        <div className="flex flex-col items-center justify-center h-52 text-text-muted">
          <TrendingUp size={32} className="mb-2 opacity-40" />
          <p className="text-xs">Add more clients to see revenue trends</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} />
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
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              labelStyle={{ color: '#8c90a0' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6c5ce7"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
