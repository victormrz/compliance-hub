/**
 * Loading skeleton for data tables — replaces simple spinners.
 * Shows animated placeholder rows while SharePoint data loads.
 */
export default function LoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
        <div className="h-5 bg-slate-200 rounded w-48" />
        <div className="flex-1" />
        <div className="h-8 bg-slate-200 rounded w-32" />
      </div>

      {/* Table header */}
      <div className="px-6 py-3 border-b border-slate-100 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded flex-1" />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="px-6 py-4 border-b border-slate-50 flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-3 bg-slate-100 rounded flex-1"
              style={{ maxWidth: colIdx === 0 ? '200px' : '150px' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Simple inline loading indicator for dashboard stat cards
 */
export function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
        <div className="h-4 bg-slate-200 rounded w-24" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-32" />
    </div>
  );
}
