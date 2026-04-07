export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 animate-pulse ${className}`}>
      <div className="h-3 w-24 bg-border rounded mb-3" />
      <div className="h-6 w-32 bg-border rounded mb-2" />
      <div className="h-2 w-16 bg-border/60 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="border-b border-border px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-border rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border/50 px-4 py-4 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-border/60 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 animate-pulse ${className}`}>
      <div className="h-3 w-32 bg-border rounded mb-4" />
      <div className="h-48 bg-border/40 rounded-lg" />
    </div>
  );
}
