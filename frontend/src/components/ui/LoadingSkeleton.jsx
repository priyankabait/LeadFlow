
export default function LoadingSkeleton({ rows = 1, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading…">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-5 rounded-lg shimmer"
          style={{ width: `${70 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

/** Full-height card skeleton used on Dashboard stat cards */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-4"
      style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded-md shimmer" />
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
      <div className="h-8 w-24 rounded-lg shimmer" />
    </div>
  );
}

/** Row skeleton for tables */
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 rounded-md shimmer" style={{ width: `${50 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}
