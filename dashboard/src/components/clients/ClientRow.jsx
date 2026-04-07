import { Pencil, Trash2, Eye } from 'lucide-react';
import ClientBadge from './ClientBadge';
import ShareClientButton from './ShareClientButton';
import QuickActionButton from '../shared/QuickActionButton';
import { formatCurrency } from '../../utils/formatters';

export default function ClientRow({ client, onEdit, onDelete, onViewDetail }) {
  const outstanding = client.totalProjectValue - client.amountPaid;

  return (
    <tr className="border-b border-border hover:bg-bg-hover/50 transition-colors duration-150">
      <td className="px-4 py-3.5">
        <div>
          <p className="text-sm font-medium text-text">{client.clientName}</p>
          <p className="text-xs text-text-muted">{client.companyName}</p>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-text-muted hidden md:table-cell">
        {client.serviceType}
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <ClientBadge label={client.onboardingStatus} />
      </td>
      <td className="px-4 py-3.5">
        <ClientBadge label={client.paymentCategory} />
      </td>
      <td className="px-4 py-3.5 text-sm text-text font-medium hidden lg:table-cell" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrency(client.totalProjectValue)}
      </td>
      <td className="px-4 py-3.5 text-sm text-success font-medium hidden lg:table-cell" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrency(client.amountPaid)}
      </td>
      <td className="px-4 py-3.5 text-sm font-medium hidden xl:table-cell" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <span className={outstanding > 0 ? 'text-danger' : 'text-success'}>
          {formatCurrency(outstanding)}
        </span>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${client.milestones || 0}%` }}
            />
          </div>
          <span className="text-xs text-text-muted w-8 text-right">{client.milestones || 0}%</span>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <QuickActionButton label="Trigger Setup" workflowName="Client Onboarding" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(client)}
              className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-accent/10 transition-colors"
              title="View details"
            >
              <Eye size={14} />
            </button>
          )}
          <ShareClientButton clientId={client.id} />
          <button
            onClick={() => onEdit(client)}
            className="p-1.5 text-text-muted hover:text-accent rounded-md hover:bg-accent/10 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="p-1.5 text-text-muted hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
