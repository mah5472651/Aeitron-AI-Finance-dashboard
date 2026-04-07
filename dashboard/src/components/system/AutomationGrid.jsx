import { Activity } from 'lucide-react';
import { useSystemHealth } from '../../context/SystemHealthContext';
import AutomationCard from './AutomationCard';

export default function AutomationGrid({ onEdit, onRequestDelete }) {
  const { automations, dispatch } = useSystemHealth();

  const healthy = automations.filter((a) => a.status === 'Healthy').length;
  const errors = automations.filter((a) => a.status === 'Error').length;
  const paused = automations.filter((a) => a.status === 'Paused').length;

  if (automations.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl py-16 flex flex-col items-center justify-center text-text-muted">
        <Activity size={40} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">No automations configured</p>
        <p className="text-xs mt-1 opacity-60">Add your first automation workflow to monitor</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/15 text-success">
          {healthy} Healthy
        </span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-danger/15 text-danger">
          {errors} Error
        </span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/15 text-warning">
          {paused} Paused
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {automations.map((automation) => (
          <AutomationCard
            key={automation.id}
            automation={automation}
            onEdit={onEdit}
            onDelete={(id) => onRequestDelete(
              () => dispatch({ type: 'DELETE_AUTOMATION', payload: id }),
              automation.workflowName
            )}
          />
        ))}
      </div>
    </div>
  );
}
