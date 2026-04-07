import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-bg-card border border-border rounded-2xl w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-danger/15 flex items-center justify-center">
              <AlertTriangle size={18} className="text-danger" />
            </div>
            <h2 className="text-base font-semibold text-text">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-text-muted leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text border border-border rounded-lg hover:bg-bg-hover transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-danger hover:bg-danger/90 rounded-lg transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
