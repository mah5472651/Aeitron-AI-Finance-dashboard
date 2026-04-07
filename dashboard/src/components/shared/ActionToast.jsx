import { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

const ICONS = {
  processing: Loader2,
  success: Check,
  error: X,
};

const STYLES = {
  processing: 'border-accent/30 bg-accent/5',
  success: 'border-success/30 bg-success/5',
  error: 'border-danger/30 bg-danger/5',
};

const ICON_STYLES = {
  processing: 'text-accent animate-spin',
  success: 'text-success',
  error: 'text-danger',
};

export default function ActionToast({ message, status = 'processing', onDismiss, duration }) {
  const [exiting, setExiting] = useState(false);
  const Icon = ICONS[status];

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 bg-bg-card border rounded-xl shadow-modal transition-all duration-300 ${
          STYLES[status]
        } ${exiting ? 'opacity-0 translate-y-4' : 'animate-slide-up'}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          status === 'processing' ? 'bg-accent/15' : status === 'success' ? 'bg-success/15' : 'bg-danger/15'
        }`}>
          <Icon size={16} className={ICON_STYLES[status]} />
        </div>
        <div>
          <p className="text-sm font-medium text-text">{message}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {status === 'processing' && 'Please wait...'}
            {status === 'success' && 'Workflow triggered successfully'}
            {status === 'error' && 'Something went wrong'}
          </p>
        </div>
      </div>
    </div>
  );
}
