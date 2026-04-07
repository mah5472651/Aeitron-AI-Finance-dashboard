import { useState } from 'react';
import { CreditCard, RotateCcw } from 'lucide-react';
import { useApiCredits } from '../../context/ApiCreditsContext';

export default function CreditMonitor() {
  const { services, dispatch } = useApiCredits();

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <CreditCard size={16} className="text-accent" />
          API Credit Monitor
        </h3>
        <button
          onClick={() => dispatch({ type: 'RESET_SERVICES' })}
          className="p-1.5 text-text-muted hover:text-accent rounded-lg hover:bg-accent/10 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <CreditBar key={service.name} service={service} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
}

function CreditBar({ service, dispatch }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const pct = service.limit > 0 ? (service.balance / service.limit) * 100 : 0;
  const barColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';

  function handleSave() {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      dispatch({
        type: 'UPDATE_SERVICE',
        payload: { name: service.name, balance: val },
      });
    }
    setEditing(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text">{service.name}</span>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-16 px-1.5 py-0.5 text-xs bg-bg border border-accent rounded text-text outline-none text-right"
              min="0"
            />
            <span className="text-xs text-text-muted">/ ${service.limit}</span>
          </div>
        ) : (
          <button
            onClick={() => { setEditValue(service.balance.toString()); setEditing(true); }}
            className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ${service.balance} / ${service.limit}
          </button>
        )}
      </div>
      <div className="h-2 bg-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
