import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import ClientFilters from './ClientFilters';
import ClientRow from './ClientRow';

export default function ClientTable({ onEdit, onRequestDelete, onViewDetail, globalSearch = '' }) {
  const { clients, dispatch } = useClients();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    serviceType: '',
    onboardingStatus: '',
    paymentCategory: '',
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let result = clients;

    const combinedSearch = (globalSearch || search).toLowerCase();
    if (combinedSearch) {
      result = result.filter(
        (c) =>
          c.clientName.toLowerCase().includes(combinedSearch) ||
          c.companyName.toLowerCase().includes(combinedSearch)
      );
    }

    if (filters.serviceType) result = result.filter((c) => c.serviceType === filters.serviceType);
    if (filters.onboardingStatus) result = result.filter((c) => c.onboardingStatus === filters.onboardingStatus);
    if (filters.paymentCategory) result = result.filter((c) => c.paymentCategory === filters.paymentCategory);

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
  }, [clients, search, globalSearch, filters, sortField, sortDir]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleDelete(client) {
    if (onRequestDelete) {
      onRequestDelete(
        () => dispatch({ type: 'DELETE_CLIENT', payload: client.id }),
        client.clientName
      );
    } else {
      dispatch({ type: 'DELETE_CLIENT', payload: client.id });
    }
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
      <ClientFilters
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Users size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {clients.length === 0 ? 'No clients yet' : 'No matching clients'}
            </p>
            <p className="text-xs mt-1 opacity-60">
              {clients.length === 0
                ? 'Add your first client to get started'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <SortHeader field="clientName">Client</SortHeader>
                  <SortHeader field="serviceType" className="hidden md:table-cell">Service</SortHeader>
                  <SortHeader field="onboardingStatus" className="hidden sm:table-cell">Status</SortHeader>
                  <SortHeader field="paymentCategory">Payment</SortHeader>
                  <SortHeader field="totalProjectValue" className="hidden lg:table-cell">Value</SortHeader>
                  <SortHeader field="amountPaid" className="hidden lg:table-cell">Paid</SortHeader>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider hidden xl:table-cell">
                    Outstanding
                  </th>
                  <SortHeader field="milestones" className="hidden md:table-cell">Progress</SortHeader>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">
                    Quick Actions
                  </th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <ClientRow
                    key={client.id}
                    client={client}
                    onEdit={onEdit}
                    onDelete={() => handleDelete(client)}
                    onViewDetail={onViewDetail}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
