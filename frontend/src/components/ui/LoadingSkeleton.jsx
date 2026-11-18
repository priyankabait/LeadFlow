
import { motion } from 'framer-motion';

function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`${width} ${height} bg-gray-200 rounded-lg`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} width="flex-1" height="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6 space-y-4">
      <SkeletonLine width="w-1/3" height="h-4" />
      <SkeletonLine width="w-1/2" height="h-8" />
      <SkeletonLine width="w-2/3" height="h-3" />
    </div>
  );
}

export default function LoadingSkeleton() {
  return <CardSkeleton />;
}
