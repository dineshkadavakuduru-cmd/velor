interface UnavailableSportsNoteProps {
  sports: { id: string; name: string; errorKind?: string }[];
  className?: string;
}

/**
 * Honest per-sport availability messaging. When a provider is down we say
 * "Live data unavailable" for that sport instead of pretending the world
 * has no matches (fake zeros destroy trust).
 */
export default function UnavailableSportsNote({ sports, className = "" }: UnavailableSportsNoteProps) {
  if (sports.length === 0) return null;

  const names = sports.map((s) => s.name).join(", ");

  return (
    <p
      role="status"
      className={`text-xs text-text-secondary font-mono tracking-wide ${className}`}
    >
      <span className="text-gold">Live data unavailable</span>
      <span> for: {names}. Showing data from available sources.</span>
    </p>
  );
}
