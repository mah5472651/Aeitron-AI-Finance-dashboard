export default function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-muted font-medium">{title}</span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-text-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}
