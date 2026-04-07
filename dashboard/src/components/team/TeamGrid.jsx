import { useMemo } from 'react';
import { UsersRound, DollarSign, UserCheck } from 'lucide-react';
import { useTeam } from '../../context/TeamContext';
import { useClients } from '../../context/ClientContext';
import { formatCurrency } from '../../utils/formatters';
import TeamCard from './TeamCard';

export default function TeamGrid({ onEdit, onRequestDelete }) {
  const { members, dispatch } = useTeam();
  const { clients } = useClients();

  const stats = useMemo(() => {
    const activeCount = members.filter((m) => m.status === 'Active').length;
    const totalPayroll = members.reduce((sum, m) => {
      const assignedRevenue = clients
        .filter((c) => (m.assignedClientIds || []).includes(c.id))
        .reduce((s, c) => s + c.amountPaid, 0);
      return sum + (m.baseSalary || 0) + ((m.commissionPercent || 0) / 100) * assignedRevenue;
    }, 0);
    return { activeCount, totalPayroll };
  }, [members, clients]);

  function handleDelete(member) {
    if (onRequestDelete) {
      onRequestDelete(
        () => dispatch({ type: 'DELETE_MEMBER', payload: member.id }),
        member.name
      );
    } else {
      dispatch({ type: 'DELETE_MEMBER', payload: member.id });
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6c5ce715' }}>
            <UsersRound size={18} style={{ color: '#6c5ce7' }} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Members</p>
            <p className="text-lg font-semibold text-text">{members.length}</p>
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
            <UserCheck size={18} style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Active</p>
            <p className="text-lg font-semibold text-text">{stats.activeCount}</p>
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
            <DollarSign size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Payroll</p>
            <p className="text-lg font-semibold text-text font-mono">{formatCurrency(stats.totalPayroll)}</p>
          </div>
        </div>
      </div>

      {/* Team cards grid */}
      {members.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-text-muted">
          <UsersRound size={40} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No team members yet</p>
          <p className="text-xs mt-1 opacity-60">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, i) => (
            <TeamCard
              key={member.id}
              member={member}
              onEdit={onEdit}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
