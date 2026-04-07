import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareClientButton({ clientId, size = 14 }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}#share/${clientId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`p-1.5 rounded-md transition-colors ${
        copied
          ? 'text-success bg-success/10'
          : 'text-text-muted hover:text-accent hover:bg-accent/10'
      }`}
      title={copied ? 'Link copied!' : 'Share client view'}
    >
      {copied ? <Check size={size} /> : <Share2 size={size} />}
    </button>
  );
}
