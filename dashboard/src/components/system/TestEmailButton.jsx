import { useState } from 'react';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function TestEmailButton() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [message, setMessage] = useState('');

  async function handleSend() {
    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'mah5472651@gmail.com' }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send email');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Cannot reach API server. Make sure it is running (npm run server).');
    }

    setTimeout(() => setStatus('idle'), 5000);
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text flex items-center gap-2 mb-3">
        <Mail size={16} className="text-accent" />
        Email Configuration
      </h3>
      <p className="text-xs text-text-muted mb-4">
        Send a test email to verify your SMTP settings are working correctly.
      </p>
      <button
        onClick={handleSend}
        disabled={status === 'sending'}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
          bg-accent text-white hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? (
          <Loader2 size={15} className="animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle size={15} />
        ) : status === 'error' ? (
          <XCircle size={15} />
        ) : (
          <Mail size={15} />
        )}
        {status === 'sending' ? 'Sending...' : 'Send Test Email'}
      </button>
      {message && (
        <p className={`text-xs mt-3 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
