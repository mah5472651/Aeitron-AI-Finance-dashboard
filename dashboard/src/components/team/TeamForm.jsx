import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTeam } from '../../context/TeamContext';
import { useClients } from '../../context/ClientContext';
import { TEAM_ROLES, TEAM_STATUSES } from '../../utils/constants';

const emptyForm = {
  name: '',
  email: '',
  role: TEAM_ROLES[0],
  status: TEAM_STATUSES[0],
  baseSalary: '',
  commissionPercent: '',
  assignedClientIds: [],
};

export default function TeamForm({ isOpen, onClose, editMember }) {
  const { dispatch } = useTeam();
  const { clients } = useClients();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editMember) {
      setForm({
        name: editMember.name,
        email: editMember.email || '',
        role: editMember.role,
        status: editMember.status,
        baseSalary: (editMember.baseSalary || 0).toString(),
        commissionPercent: (editMember.commissionPercent || 0).toString(),
        assignedClientIds: editMember.assignedClientIds || [],
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editMember, isOpen]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    const salary = parseFloat(form.baseSalary);
    if (form.baseSalary && (isNaN(salary) || salary < 0)) errs.baseSalary = 'Enter a valid amount';
    const commission = parseFloat(form.commissionPercent);
    if (form.commissionPercent && (isNaN(commission) || commission < 0 || commission > 100)) errs.commissionPercent = 'Enter 0-100';
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
    const memberData = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
      baseSalary: parseFloat(form.baseSalary) || 0,
      commissionPercent: parseFloat(form.commissionPercent) || 0,
      assignedClientIds: form.assignedClientIds,
    };

    if (editMember) {
      dispatch({
        type: 'UPDATE_MEMBER',
        payload: { id: editMember.id, ...memberData, updatedAt: now },
      });
    } else {
      dispatch({
        type: 'ADD_MEMBER',
        payload: {
          id: crypto.randomUUID(),
          ...memberData,
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

  function toggleClient(clientId) {
    setForm((prev) => ({
      ...prev,
      assignedClientIds: prev.assignedClientIds.includes(clientId)
        ? prev.assignedClientIds.filter((id) => id !== clientId)
        : [...prev.assignedClientIds, clientId],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text">
            {editMember ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => handleChange('name', v)}
              error={errors.name}
              placeholder="Jane Smith"
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              placeholder="jane@aeitron.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              value={form.role}
              onChange={(v) => handleChange('role', v)}
              options={TEAM_ROLES}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(v) => handleChange('status', v)}
              options={TEAM_STATUSES}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Base Salary ($)"
              type="number"
              value={form.baseSalary}
              onChange={(v) => handleChange('baseSalary', v)}
              error={errors.baseSalary}
              placeholder="3000"
              min="0"
            />
            <Field
              label="Commission (%)"
              type="number"
              value={form.commissionPercent}
              onChange={(v) => handleChange('commissionPercent', v)}
              error={errors.commissionPercent}
              placeholder="10"
              min="0"
              max="100"
            />
          </div>

          {/* Client assignment */}
          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Assign Clients</label>
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg-hover cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.assignedClientIds.includes(client.id)}
                      onChange={() => toggleClient(client.id)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-text">{client.clientName}</span>
                    <span className="text-xs text-text-muted ml-auto">{client.companyName}</span>
                  </label>
                ))}
              </div>
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
              {editMember ? 'Save Changes' : 'Add Member'}
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
