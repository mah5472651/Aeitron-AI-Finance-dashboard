import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useExpenses } from '../../context/ExpenseContext';
import { calcRevenueVsExpensesOverTime } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export default function RevenueVsExpensesChart() {
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const data = useMemo(() => calcRevenueVsExpensesOverTime(clients, expenses), [clients, expenses]);

  const hasData = data.some((d) => d.revenue > 0 || d.expenses > 0);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 lg:col-span-2">
      <h3 className="text-sm font-semibold text-text mb-4">Revenue vs Expenses (6 months)</h3>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-52 text-text-muted">
          <BarChart3 size={32} className="mb-2 opacity-40" />
          <p className="text-xs">Add clients and expenses to see comparison</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
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
              formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Expenses']}
              labelStyle={{ color: '#8c90a0' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#8c90a0' }}
              formatter={(value) => (value === 'revenue' ? 'Revenue' : 'Expenses')}
            />
            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
