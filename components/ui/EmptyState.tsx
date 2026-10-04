interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ title, description, className = "" }: EmptyStateProps) {
  return (
    <div role="status" className={`flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle ${className}`}>
      <p className="technical-label mb-2">{title}</p>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm">{description}</p>
      )}
    </div>
  );
}
