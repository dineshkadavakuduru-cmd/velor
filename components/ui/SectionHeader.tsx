import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  count?: number;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "VIEW ALL →",
  count,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        <h2 className="font-display text-base sm:text-lg font-medium tracking-tight text-text-primary">
          {title}
        </h2>
        {typeof count === "number" && (
          <span className="data-number text-xs text-text-secondary">
            {count}
          </span>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="font-mono text-xs tracking-widest text-text-secondary hover:text-live transition-colors shrink-0"
        >
          {linkLabel}
        </Link>
      )}
      {subtitle && (
        <p className="text-xs text-text-secondary font-mono tracking-wide hidden sm:block">
          {subtitle}
        </p>
      )}
    </div>
  );
}
