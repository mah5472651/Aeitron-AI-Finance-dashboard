import { Search } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

export default function ExpenseFilters({ search, onSearchChange, categoryFilter, onCategoryChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-muted/50 outline-none focus:border-accent transition-colors"
        />
      </div>
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text-muted outline-none focus:border-accent transition-colors"
      >
        <option value="">All Categories</option>
        {EXPENSE_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}
