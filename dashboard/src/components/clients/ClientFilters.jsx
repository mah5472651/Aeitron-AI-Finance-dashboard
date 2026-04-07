import { Search } from 'lucide-react';
import { SERVICE_TYPES, ONBOARDING_STATUSES, PAYMENT_CATEGORIES } from '../../utils/constants';

export default function ClientFilters({ search, onSearchChange, filters, onFilterChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-muted/50 outline-none focus:border-accent transition-colors"
        />
      </div>
      <FilterSelect
        value={filters.serviceType}
        onChange={(v) => onFilterChange('serviceType', v)}
        options={SERVICE_TYPES}
        placeholder="All Services"
      />
      <FilterSelect
        value={filters.onboardingStatus}
        onChange={(v) => onFilterChange('onboardingStatus', v)}
        options={ONBOARDING_STATUSES}
        placeholder="All Statuses"
      />
      <FilterSelect
        value={filters.paymentCategory}
        onChange={(v) => onFilterChange('paymentCategory', v)}
        options={PAYMENT_CATEGORIES}
        placeholder="All Payments"
      />
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text-muted outline-none focus:border-accent transition-colors"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
