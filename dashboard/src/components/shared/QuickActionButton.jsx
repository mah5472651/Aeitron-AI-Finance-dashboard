import { useState, useCallback } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import ActionToast from './ActionToast';

export default function QuickActionButton({ label = 'Trigger Setup', workflowName = 'Client Onboarding' }) {
  const [state, setState] = useState('idle'); // idle | processing | success

  const handleTrigger = useCallback(() => {
    if (state !== 'idle') return;
    setState('processing');

    setTimeout(() => {
      setState('success');
    }, 2000);
  }, [state]);

  const handleDismiss = useCallback(() => {
    setState('idle');
  }, []);

  return (
    <>
      <button
        onClick={handleTrigger}
        disabled={state !== 'idle'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
          state === 'idle'
            ? 'text-warning bg-warning/10 hover:bg-warning/20 hover:-translate-y-0.5'
            : state === 'processing'
            ? 'text-text-muted bg-bg cursor-wait'
            : 'text-success bg-success/10'
        }`}
        title={`Trigger n8n ${workflowName} Workflow`}
      >
        {state === 'processing' ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Zap size={12} />
        )}
        <span className="hidden xl:inline">
          {state === 'idle' && label}
          {state === 'processing' && 'Processing'}
          {state === 'success' && 'Sent'}
        </span>
      </button>

      {state === 'processing' && (
        <ActionToast
          message={`Initiating n8n ${workflowName} Workflow...`}
          status="processing"
        />
      )}
      {state === 'success' && (
        <ActionToast
          message={`n8n ${workflowName} Workflow Complete`}
          status="success"
          duration={2000}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
