import { useMemo, useState } from 'react';
import { Kanban } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import { calcLeadsByStage, calcPipelineValue, calcWeightedPipelineValue } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { LEAD_STAGES, LEAD_STAGE_COLORS } from '../../utils/constants';
import LeadCard from './LeadCard';

export default function LeadBoard({ onEdit, globalSearch = '' }) {
  const { leads, dispatch } = useLeads();

  const filteredLeads = useMemo(() => {
    if (!globalSearch) return leads;
    const q = globalSearch.toLowerCase();
    return leads.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
    );
  }, [leads, globalSearch]);

  const grouped = useMemo(() => calcLeadsByStage(filteredLeads), [filteredLeads]);
  const pipelineValue = useMemo(() => calcPipelineValue(filteredLeads), [filteredLeads]);
  const weightedValue = useMemo(() => calcWeightedPipelineValue(filteredLeads), [filteredLeads]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  function handleDelete(id) {
    dispatch({ type: 'DELETE_LEAD', payload: id });
  }

  function handleDrop(stage) {
    if (draggingId) {
      dispatch({
        type: 'UPDATE_LEAD',
        payload: { id: draggingId, stage },
      });
    }
    setDraggingId(null);
    setDragOverStage(null);
  }

  function handleDragOver(e, stage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }

  if (filteredLeads.length === 0 && leads.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl py-16 flex flex-col items-center justify-center text-text-muted">
        <Kanban size={40} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">No leads yet</p>
        <p className="text-xs mt-1 opacity-60">Add your first lead to start the pipeline</p>
      </div>
    );
  }

  const activeStages = LEAD_STAGES.filter((s) => s !== 'Won' && s !== 'Lost');
  const closedStages = LEAD_STAGES.filter((s) => s === 'Won' || s === 'Lost');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-text-muted">
          Pipeline: <span className="font-semibold text-text">{formatCurrency(pipelineValue)}</span>
        </span>
        <span className="text-sm text-text-muted">
          Weighted: <span className="font-semibold text-accent">{formatCurrency(weightedValue)}</span>
        </span>
        <span className="text-xs text-text-muted/60">
          ({filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''})
        </span>
      </div>

      {/* Active pipeline stages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {activeStages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            leads={grouped[stage] || []}
            onEdit={onEdit}
            onDelete={handleDelete}
            onDragStart={setDraggingId}
            onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(stage)}
            isOver={dragOverStage === stage}
            isDragging={!!draggingId}
          />
        ))}
      </div>

      {/* Won / Lost */}
      <div className="grid grid-cols-2 gap-3">
        {closedStages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            leads={grouped[stage] || []}
            onEdit={onEdit}
            onDelete={handleDelete}
            onDragStart={setDraggingId}
            onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(stage)}
            isOver={dragOverStage === stage}
            isDragging={!!draggingId}
          />
        ))}
      </div>
    </div>
  );
}

function StageColumn({ stage, leads, onEdit, onDelete, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, isOver, isDragging }) {
  return (
    <div className="flex flex-col min-h-[200px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: LEAD_STAGE_COLORS[stage] }}
        />
        <span className="text-xs font-semibold text-text uppercase tracking-wider">
          {stage}
        </span>
        <span className="text-xs text-text-muted ml-auto">{leads.length}</span>
      </div>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => { e.preventDefault(); onDrop(); }}
        className={`
          flex-1 space-y-2 p-2 rounded-xl border transition-colors duration-200
          ${isOver && isDragging
            ? 'bg-accent/5 border-accent/40 ring-1 ring-accent/20'
            : 'bg-bg border-border-light'
          }
        `}
      >
        {leads.length === 0 ? (
          <p className={`text-xs text-center py-8 ${isDragging ? 'text-accent/60' : 'text-text-muted/40'}`}>
            {isDragging ? 'Drop here' : 'No leads'}
          </p>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}
