import { Pencil, Trash2, Zap } from 'lucide-react';
import { BADGE_COLORS } from '../../utils/constants';

export default function AutomationCard({ automation, onEdit, onDelete }) {
  const statusColor = BADGE_COLORS[automation.status] || '';
  const timeAgo = automation.lastRun ? formatTimeAgo(automation.lastRun) : 'Never run';

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap size={16} className="text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{automation.workflowName}</p>
            <p className="text-xs text-text-muted truncate">{automation.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          <button
            onClick={() => onEdit(automation)}
            className="p-1 text-text-muted hover:text-accent rounded hover:bg-accent/10 transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(automation.id)}
            className="p-1 text-text-muted hover:text-danger rounded hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
          {automation.status}
        </span>
        <span className="text-xs text-text-muted">{timeAgo}</span>
      </div>

      {automation.notes && (
        <p className="text-xs text-text-muted/70 mt-2 truncate">{automation.notes}</p>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
