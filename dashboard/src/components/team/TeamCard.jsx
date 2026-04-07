import { Pencil, Trash2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClients } from '../../context/ClientContext';
import { TEAM_STATUS_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import ClientBadge from '../clients/ClientBadge';

export default function TeamCard({ member, onEdit, onDelete, index = 0 }) {
  const { clients } = useClients();

  const assignedClients = clients.filter((c) =>
    (member.assignedClientIds || []).includes(c.id)
  );
  const assignedRevenue = assignedClients.reduce((sum, c) => sum + c.amountPaid, 0);
  const totalPayout = (member.baseSalary || 0) + ((member.commissionPercent || 0) / 100) * assignedRevenue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="bg-bg-card border border-border rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{member.name}</h3>
            <p className="text-xs text-text-muted">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-accent/10 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 text-text-muted hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <ClientBadge label={member.role} />
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${TEAM_STATUS_COLORS[member.status] || ''}`}>
          {member.status}
        </span>
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted flex items-center gap-1.5">
            <Users size={12} />
            Assigned Clients
          </span>
          <span className="font-medium text-text">{assignedClients.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Base Salary</span>
          <span className="font-medium text-text font-mono">{formatCurrency(member.baseSalary || 0)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Commission</span>
          <span className="font-medium text-text">{member.commissionPercent || 0}%</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-border-light">
          <span className="text-text-muted font-medium">Total Payout</span>
          <span className="font-semibold text-accent font-mono">{formatCurrency(totalPayout)}</span>
        </div>
      </div>
    </motion.div>
  );
}
