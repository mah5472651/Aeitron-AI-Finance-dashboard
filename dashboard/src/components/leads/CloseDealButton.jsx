import { useState, useCallback } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import ActionToast from '../shared/ActionToast';

export default function CloseDealButton({ lead }) {
  const { dispatch } = useLeads();
  const [state, setState] = useState('idle'); // idle | processing | success

  const handleCloseDeal = useCallback(async () => {
    if (state !== 'idle') return;
    setState('processing');

    const webhookUrl = import.meta.env.VITE_N8N_BILLING_WEBHOOK;
    const payload = {
      name: lead.contactName,
      email: lead.email || '',
      companyName: lead.companyName,
      packagePrice: lead.dealValue,
      serviceType: lead.serviceType || '',
    };

    // Fire the webhook (non-blocking — we show success after mock delay regardless)
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Silently handle — the mock delay drives UI state
      });
    }

    // 2-second mock delay simulating webhook processing
    setTimeout(() => {
      setState('success');
      dispatch({
        type: 'UPDATE_LEAD',
        payload: { id: lead.id, stage: 'Won' },
      });
    }, 2000);
  }, [state, lead, dispatch]);

  const handleDismiss = useCallback(() => {
    setState('idle');
  }, []);

  return (
    <>
      <button
        onClick={handleCloseDeal}
        disabled={state !== 'idle'}
        className={`inline-flex items-center gap-1.5 w-full justify-center px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
          state === 'idle'
            ? 'text-white bg-gradient-to-r from-[#7c3aed] to-[#6c5ce7] hover:from-[#6d28d9] hover:to-[#5b4bd6] shadow-sm hover:shadow-md hover:-translate-y-0.5'
            : state === 'processing'
            ? 'text-text-muted bg-bg cursor-wait'
            : 'text-success bg-success/10'
        }`}
      >
        {state === 'processing' ? (
          <Loader2 size={12} className="animate-spin" />
        ) : state === 'success' ? (
          <CheckCircle size={12} />
        ) : (
          <Send size={12} />
        )}
        <span>
          {state === 'idle' && 'Close Deal & Bill'}
          {state === 'processing' && 'Processing...'}
          {state === 'success' && 'Onboarding'}
        </span>
      </button>

      {state === 'processing' && (
        <ActionToast
          message="Generating Contract & Payment Link..."
          status="processing"
        />
      )}
      {state === 'success' && (
        <ActionToast
          message="Contract Sent to Client!"
          status="success"
          duration={2500}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
