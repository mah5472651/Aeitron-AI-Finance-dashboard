import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useTeam } from '../../context/TeamContext';
import { SERVICE_TYPES, ONBOARDING_STATUSES, PAYMENT_CATEGORIES, ROADMAP_STAGES } from '../../utils/constants';

const emptyForm = {
  clientName: '',
  companyName: '',
  serviceType: SERVICE_TYPES[0],
  onboardingStatus: ONBOARDING_STATUSES[0],
  paymentCategory: PAYMENT_CATEGORIES[0],
  totalProjectValue: '',
  amountPaid: '',
  milestones: '0',
  deadline: '',
  roadmapStage: ROADMAP_STAGES[0],
  assignedAgentId: '',
};

export default function ClientForm({ isOpen, onClose, editClient }) {
  const { dispatch } = useClients();
  const { members } = useTeam();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editClient) {
      setForm({
        clientName: editClient.clientName,
        companyName: editClient.companyName,
        serviceType: editClient.serviceType,
        onboardingStatus: editClient.onboardingStatus,
        paymentCategory: editClient.paymentCategory,
        totalProjectValue: editClient.totalProjectValue.toString(),
        amountPaid: editClient.amountPaid.toString(),
        milestones: (editClient.milestones || 0).toString(),
        deadline: editClient.deadline ? editClient.deadline.split('T')[0] : '',
        roadmapStage: editClient.roadmapStage || ROADMAP_STAGES[0],
        assignedAgentId: editClient.assignedAgentId || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editClient, isOpen]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (!form.clientName.trim()) errs.clientName = 'Required';
    if (!form.companyName.trim()) errs.companyName = 'Required';
    const total = parseFloat(form.totalProjectValue);
    const paid = parseFloat(form.amountPaid);
    if (isNaN(total) || total < 0) errs.totalProjectValue = 'Enter a valid amount';
    if (isNaN(paid) || paid < 0) errs.amountPaid = 'Enter a valid amount';
    if (!isNaN(total) && !isNaN(paid) && paid > total) errs.amountPaid = 'Cannot exceed total value';
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
    const clientData = {
      clientName: form.clientName.trim(),
      companyName: form.companyName.trim(),
      serviceType: form.serviceType,
      onboardingStatus: form.onboardingStatus,
      paymentCategory: form.paymentCategory,
      totalProjectValue: parseFloat(form.totalProjectValue),
      amountPaid: parseFloat(form.amountPaid),
      milestones: parseInt(form.milestones) || 0,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      roadmapStage: form.roadmapStage,
      assignedAgentId: form.assignedAgentId || null,
    };

    if (editClient) {
      dispatch({
        type: 'UPDATE_CLIENT',
        payload: { id: editClient.id, ...clientData, updatedAt: now },
      });
    } else {
      dispatch({
        type: 'ADD_CLIENT',
        payload: {
          id: crypto.randomUUID(),
          ...clientData,
          createdAt: now,
          updatedAt: now,
        },
      });
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
            {editClient ? 'Edit Client' : 'Add New Client'}
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
              placeholder="John Doe"
            />
            <Field
              label="Company Name"
              value={form.companyName}
              onChange={(v) => handleChange('companyName', v)}
              error={errors.companyName}
              placeholder="Acme Inc."
            />
          </div>

          <Select
            label="Service Type"
            value={form.serviceType}
            onChange={(v) => handleChange('serviceType', v)}
            options={SERVICE_TYPES}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Onboarding Status"
              value={form.onboardingStatus}
              onChange={(v) => handleChange('onboardingStatus', v)}
              options={ONBOARDING_STATUSES}
            />
            <Select
              label="Payment Category"
              value={form.paymentCategory}
              onChange={(v) => handleChange('paymentCategory', v)}
              options={PAYMENT_CATEGORIES}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Total Project Value ($)"
              type="number"
              value={form.totalProjectValue}
              onChange={(v) => handleChange('totalProjectValue', v)}
              error={errors.totalProjectValue}
              placeholder="10000"
              min="0"
            />
            <Field
              label="Amount Paid ($)"
              type="number"
              value={form.amountPaid}
              onChange={(v) => handleChange('amountPaid', v)}
              error={errors.amountPaid}
              placeholder="5000"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Project Completion (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.milestones}
                onChange={(e) => handleChange('milestones', e.target.value)}
                className="flex-1 accent-accent"
              />
              <span className="text-sm font-medium text-text w-10 text-right">{form.milestones}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Roadmap Stage"
              value={form.roadmapStage}
              onChange={(v) => handleChange('roadmapStage', v)}
              options={ROADMAP_STAGES}
            />
            <Field
              label="Project Deadline"
              type="date"
              value={form.deadline}
              onChange={(v) => handleChange('deadline', v)}
            />
          </div>

          {members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Assigned Agent</label>
              <select
                value={form.assignedAgentId}
                onChange={(e) => handleChange('assignedAgentId', e.target.value)}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            </div>
          )}

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
              {editClient ? 'Save Changes' : 'Add Client'}
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

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
