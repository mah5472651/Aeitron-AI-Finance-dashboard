import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import { LEAD_STAGES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { calcLeadScore, calcNeedsFollowup } from '../../utils/calculations';
import QuickActionButton from '../shared/QuickActionButton';
import CloseDealButton from './CloseDealButton';

export default function LeadCard({ lead, onEdit, onDelete, onDragStart, onDragEnd }) {
  const { dispatch } = useLeads();
  const leadScore = calcLeadScore(lead);
  const needsFollowup = calcNeedsFollowup(lead);

  function handleStageChange(newStage) {
    dispatch({
      type: 'UPDATE_LEAD',
      payload: { id: lead.id, stage: newStage },
    });
  }

  function formatRelativeDate(dateStr) {
    if (!dateStr) return 'Never';
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 60 * 60 * 1000));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', lead.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(lead.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      className="bg-bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          <GripVertical size={14} className="text-text-muted/40 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {needsFollowup && (
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse shrink-0" title="Follow-up needed" />
              )}
              <p className="text-sm font-medium text-text truncate">{lead.contactName}</p>
            </div>
            <p className="text-xs text-text-muted truncate">{lead.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          <button
            onClick={() => onEdit(lead)}
            className="p-1 text-text-muted hover:text-accent rounded hover:bg-accent/10 transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            className="p-1 text-text-muted hover:text-danger rounded hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-lg font-bold text-text" style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(lead.dealValue)}
        </p>
        {leadScore > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
            {formatCurrency(leadScore)}
          </span>
        )}
      </div>

      <select
        value={lead.stage}
        onChange={(e) => handleStageChange(e.target.value)}
        className="w-full px-2 py-1.5 bg-bg border border-border rounded-lg text-xs text-text-muted outline-none focus:border-accent transition-colors"
      >
        {LEAD_STAGES.map((stage) => (
          <option key={stage} value={stage}>{stage}</option>
        ))}
      </select>

      <div className="mt-2.5">
        {lead.stage === 'Hot' || lead.stage === 'Proposal Sent' ? (
          <CloseDealButton lead={lead} />
        ) : (
          <QuickActionButton label="Trigger Setup" workflowName="Lead Outreach" />
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        {lead.source && (
          <p className="text-xs text-text-muted/60 truncate">via {lead.source}</p>
        )}
        <p className={`text-xs ml-auto ${needsFollowup ? 'text-danger font-medium' : 'text-text-muted/60'}`}>
          {formatRelativeDate(lead.lastContacted)}
        </p>
      </div>
    </div>
  );
}
