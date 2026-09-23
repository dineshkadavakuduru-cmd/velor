interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export default function LoadingSkeleton({ lines = 3, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`border-b border-border-subtle ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="px-4 sm:px-6 py-4 border-b border-border-subtle last:border-b-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-32 bg-surface-2/60 animate-pulse rounded-sm" />
            <div className="h-3 w-10 bg-surface-2/60 animate-pulse rounded-sm" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-48 bg-surface-2/60 animate-pulse rounded-sm" />
            <div className="h-4 w-48 bg-surface-2/60 animate-pulse rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
