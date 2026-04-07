import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { calcPaymentBreakdown } from '../../utils/calculations';

export default function PaymentPieChart() {
  const { clients } = useClients();
  const data = useMemo(() => calcPaymentBreakdown(clients), [clients]);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text mb-4">Payment Breakdown</h3>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-text-muted">
          <PieIcon size={32} className="mb-2 opacity-40" />
          <p className="text-xs">Add clients to see payment distribution</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e4ea',
                  borderRadius: '8px',
                  color: '#1a1d26',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value, name) => [`${value} client${value !== 1 ? 's' : ''}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
