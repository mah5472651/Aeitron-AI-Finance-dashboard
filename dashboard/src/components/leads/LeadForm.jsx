import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import { LEAD_STAGES, SERVICE_TYPES } from '../../utils/constants';

const emptyForm = {
  contactName: '',
  email: '',
  companyName: '',
  dealValue: '',
  stage: LEAD_STAGES[0],
  serviceType: '',
  source: '',
  notes: '',
  lastContacted: '',
};

export default function LeadForm({ isOpen, onClose, editLead }) {
  const { dispatch } = useLeads();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editLead) {
      setForm({
        contactName: editLead.contactName,
        email: editLead.email || '',
        companyName: editLead.companyName,
        dealValue: editLead.dealValue.toString(),
        stage: editLead.stage,
        serviceType: editLead.serviceType || '',
        source: editLead.source || '',
        notes: editLead.notes || '',
        lastContacted: editLead.lastContacted ? editLead.lastContacted.split('T')[0] : '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editLead, isOpen]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (!form.contactName.trim()) errs.contactName = 'Required';
    if (!form.companyName.trim()) errs.companyName = 'Required';
    const val = parseFloat(form.dealValue);
    if (isNaN(val) || val < 0) errs.dealValue = 'Enter a valid amount';
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
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      companyName: form.companyName.trim(),
      dealValue: parseFloat(form.dealValue),
      stage: form.stage,
      serviceType: form.serviceType,
      source: form.source.trim(),
      notes: form.notes.trim(),
      lastContacted: form.lastContacted ? new Date(form.lastContacted).toISOString() : null,
    };

    if (editLead) {
      dispatch({ type: 'UPDATE_LEAD', payload: { id: editLead.id, ...data, updatedAt: now } });
    } else {
      dispatch({ type: 'ADD_LEAD', payload: { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now } });
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
            {editLead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Contact Name"
              value={form.contactName}
              onChange={(v) => handleChange('contactName', v)}
              error={errors.contactName}
              placeholder="Jane Smith"
            />
            <Field
              label="Company Name"
              value={form.companyName}
              onChange={(v) => handleChange('companyName', v)}
              error={errors.companyName}
              placeholder="Tech Corp"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              placeholder="jane@techcorp.com"
            />
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Service Type</label>
              <select
                value={form.serviceType}
                onChange={(e) => handleChange('serviceType', e.target.value)}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
              >
                <option value="">Select service...</option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Deal Value ($)"
              type="number"
              value={form.dealValue}
              onChange={(v) => handleChange('dealValue', v)}
              error={errors.dealValue}
              placeholder="15000"
              min="0"
            />
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Stage</label>
              <select
                value={form.stage}
                onChange={(e) => handleChange('stage', e.target.value)}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Source"
              value={form.source}
              onChange={(v) => handleChange('source', v)}
              placeholder="Referral, LinkedIn, Website..."
            />
            <Field
              label="Last Contacted"
              type="date"
              value={form.lastContacted}
              onChange={(v) => handleChange('lastContacted', v)}
            />
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
              {editLead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, type = 'text', ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 bg-bg border rounded-lg text-text text-sm placeholder-text-muted/50 outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30 ${error ? 'border-danger' : 'border-border'}`}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
