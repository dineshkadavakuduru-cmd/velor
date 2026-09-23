import RetryButton from "@/components/live/RetryButton";

interface ErrorStateProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  className?: string;
}

export default function ErrorState({
  title = "SPORTS DATA UNAVAILABLE",
  description = "We couldn't load the requested data. Please try again.",
  showRetry = true,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle ${className}`}>
      <p className="technical-label mb-2">{title}</p>
      <p className="text-sm text-text-secondary max-w-sm mb-4">{description}</p>
      {showRetry && <RetryButton />}
    </div>
  );
}
