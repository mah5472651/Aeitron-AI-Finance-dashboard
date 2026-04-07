import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

const emptyForm = {
  description: '',
  category: EXPENSE_CATEGORIES[0],
  amount: '',
  date: new Date().toISOString().split('T')[0],
  recurring: false,
};

export default function ExpenseForm({ isOpen, onClose, editExpense }) {
  const { dispatch } = useExpenses();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editExpense) {
      setForm({
        description: editExpense.description,
        category: editExpense.category,
        amount: editExpense.amount.toString(),
        date: editExpense.date.split('T')[0],
        recurring: editExpense.recurring,
      });
    } else {
      setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    }
    setErrors({});
  }, [editExpense, isOpen]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Required';
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Required';
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
      description: form.description.trim(),
      category: form.category,
      amount: parseFloat(form.amount),
      date: new Date(form.date).toISOString(),
      recurring: form.recurring,
    };

    if (editExpense) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: { id: editExpense.id, ...data, updatedAt: now } });
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now } });
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
            {editExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g. OpenAI API monthly"
              className={`w-full px-3 py-2.5 bg-bg border rounded-lg text-text text-sm placeholder-text-muted/50 outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30 ${errors.description ? 'border-danger' : 'border-border'}`}
            />
            {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="500"
                min="0"
                className={`w-full px-3 py-2.5 bg-bg border rounded-lg text-text text-sm placeholder-text-muted/50 outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30 ${errors.amount ? 'border-danger' : 'border-border'}`}
              />
              {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`w-full px-3 py-2.5 bg-bg border rounded-lg text-text text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30 ${errors.date ? 'border-danger' : 'border-border'}`}
              />
              {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => handleChange('recurring', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
                />
                <span className="text-sm text-text-muted">Recurring expense</span>
              </label>
            </div>
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
              {editExpense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
