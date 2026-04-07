import { useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { useTeam } from '../../context/TeamContext';
import { useClients } from '../../context/ClientContext';
import { formatCurrency } from '../../utils/formatters';

export default function PayoutCalculator() {
  const { members } = useTeam();
  const { clients } = useClients();

  const rows = useMemo(() => {
    return members.map((m) => {
      const assignedClients = clients.filter((c) =>
        (m.assignedClientIds || []).includes(c.id)
      );
      const assignedRevenue = assignedClients.reduce((sum, c) => sum + c.amountPaid, 0);
      const commissionAmount = ((m.commissionPercent || 0) / 100) * assignedRevenue;
      const totalPayout = (m.baseSalary || 0) + commissionAmount;
      return { ...m, assignedRevenue, commissionAmount, totalPayout };
    });
  }, [members, clients]);

  const totals = useMemo(() => ({
    baseSalary: rows.reduce((s, r) => s + (r.baseSalary || 0), 0),
    commissionAmount: rows.reduce((s, r) => s + r.commissionAmount, 0),
    totalPayout: rows.reduce((s, r) => s + r.totalPayout, 0),
  }), [rows]);

  if (members.length === 0) return null;

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-5 border-b border-border">
        <Calculator size={18} className="text-accent" />
        <h3 className="text-sm font-semibold text-text">Payout Calculator</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">Role</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Base Salary</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Commission %</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">Client Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Total Payout</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-bg-hover/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                      {row.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-text">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted hidden sm:table-cell">{row.role}</td>
                <td className="px-4 py-3 text-sm text-text text-right font-mono">{formatCurrency(row.baseSalary || 0)}</td>
                <td className="px-4 py-3 text-sm text-text text-right hidden md:table-cell">{row.commissionPercent || 0}%</td>
                <td className="px-4 py-3 text-sm text-text text-right font-mono hidden lg:table-cell">{formatCurrency(row.assignedRevenue)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-accent text-right font-mono">{formatCurrency(row.totalPayout)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-border">
            <tr className="bg-bg-hover/30">
              <td className="px-4 py-3 text-sm font-semibold text-text" colSpan={2}>Totals</td>
              <td className="px-4 py-3 text-sm font-semibold text-text text-right font-mono">{formatCurrency(totals.baseSalary)}</td>
              <td className="px-4 py-3 hidden md:table-cell" />
              <td className="px-4 py-3 hidden lg:table-cell" />
              <td className="px-4 py-3 text-sm font-bold text-accent text-right font-mono">{formatCurrency(totals.totalPayout)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
