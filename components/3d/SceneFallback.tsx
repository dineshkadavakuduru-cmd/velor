export default function SceneFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex flex-col items-start gap-1">
        <span className="technical-label">SYSTEM / INITIALIZING</span>
        <span className="technical-label">ENVIRONMENT / READYING</span>
      </div>
    </div>
  );
}
