import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSystemHealth } from '../../context/SystemHealthContext';
import { AUTOMATION_STATUSES } from '../../utils/constants';

const emptyForm = {
  clientName: '',
  workflowName: '',
  status: AUTOMATION_STATUSES[0],
  notes: '',
};

export default function AutomationForm({ isOpen, onClose, editAutomation }) {
  const { dispatch } = useSystemHealth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editAutomation) {
      setForm({
        clientName: editAutomation.clientName,
        workflowName: editAutomation.workflowName,
        status: editAutomation.status,
        notes: editAutomation.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editAutomation, isOpen]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (!form.clientName.trim()) errs.clientName = 'Required';
    if (!form.workflowName.trim()) errs.workflowName = 'Required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const data = {
      clientName: form.clientName.trim(),
      workflowName: form.workflowName.trim(),
      status: form.status,
      notes: form.notes.trim(),
      lastRun: now,
    };

    if (editAutomation) {
      dispatch({ type: 'UPDATE_AUTOMATION', payload: { id: editAutomation.id, ...data } });
    } else {
      dispatch({ type: 'ADD_AUTOMATION', payload: { id: crypto.randomUUID(), ...data } });
    }

    onClose();
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text">
            {editAutomation ? 'Edit Automation' : 'Add Automation'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Client Name"
              value={form.clientName}
              onChange={(v) => handleChange('clientName', v)}
              error={errors.clientName}
              placeholder="Acme Inc."
            />
            <Field
              label="Workflow Name"
              value={form.workflowName}
              onChange={(v) => handleChange('workflowName', v)}
              error={errors.workflowName}
              placeholder="Email Automation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
            >
              {AUTOMATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional context..."
              rows={3}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-text text-sm placeholder-text-muted/50 outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text border border-border rounded-lg hover:bg-bg-hover transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              {editAutomation ? 'Save Changes' : 'Add Automation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 bg-bg border rounded-lg text-text text-sm placeholder-text-muted/50 outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30 ${error ? 'border-danger' : 'border-border'}`}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
