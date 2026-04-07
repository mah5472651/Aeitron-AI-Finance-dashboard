import { useState, useMemo } from 'react';
import { Receipt, Pencil, Trash2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BADGE_COLORS } from '../../utils/constants';
import ExpenseFilters from './ExpenseFilters';

export default function ExpenseTable({ onEdit, globalSearch = '' }) {
  const { expenses, dispatch } = useExpenses();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let result = expenses;

    const combinedSearch = (globalSearch || search).toLowerCase();
    if (combinedSearch) {
      result = result.filter((e) => e.description.toLowerCase().includes(combinedSearch));
    }
    if (categoryFilter) {
      result = result.filter((e) => e.category === categoryFilter);
    }

    result = [...result].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [expenses, search, globalSearch, categoryFilter, sortField, sortDir]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }

  const SortHeader = ({ field, children, className = '' }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text transition-colors select-none ${className}`}
    >
      {children}
      {sortField === field && (
        <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
      )}
    </th>
  );

  return (
    <div className="space-y-4">
      <ExpenseFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Receipt size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
            </p>
            <p className="text-xs mt-1 opacity-60">
              {expenses.length === 0
                ? 'Add your first expense to start tracking'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <SortHeader field="description">Description</SortHeader>
                  <SortHeader field="category" className="hidden sm:table-cell">Category</SortHeader>
                  <SortHeader field="amount">Amount</SortHeader>
                  <SortHeader field="date" className="hidden md:table-cell">Date</SortHeader>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">
                    Recurring
                  </th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense) => (
                  <tr key={expense.id} className="border-b border-border hover:bg-bg-hover/50 transition-colors duration-150">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-text">{expense.description}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-danger" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-muted hidden md:table-cell">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {expense.recurring ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent">
                          Recurring
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">One-time</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(expense)}
                          className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-accent/10 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 text-text-muted hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryBadge(category) {
  const map = {
    'API Costs': 'bg-info/15 text-info',
    'Hosting': 'bg-accent/15 text-accent',
    'Salaries': 'bg-success/15 text-success',
    'Software': 'bg-warning/15 text-warning',
    'Marketing': 'bg-danger/15 text-danger',
    'Other': 'bg-bg-hover text-text-muted',
  };
  return map[category] || 'bg-bg-hover text-text-muted';
}
