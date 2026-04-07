import { BADGE_COLORS } from '../../utils/constants';

export default function ClientBadge({ label }) {
  const colorClass = BADGE_COLORS[label] || 'bg-bg-hover text-text-muted';
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}
