import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="w-full max-w-lg mx-auto">
        <span className="font-mono text-xs tracking-[0.3em] text-danger uppercase mb-3 inline-block">
          STATUS 404 · SIGNAL LOST
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-text-primary mb-4">
          PAGE NOT FOUND
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto mb-8 font-body">
          The requested coordinate does not exist in the VELOR sports intelligence matrix. It may have been relocated or the fixture has expired.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-text-primary text-background font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
          >
            COMMAND CENTER
          </Link>
          <Link
            href="/live"
            className="px-5 py-2.5 border border-border-default text-text-primary font-mono text-xs tracking-widest hover:border-live hover:text-live transition-colors"
          >
            LIVE MATCHES
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 border border-border-default text-text-secondary font-mono text-xs tracking-widest hover:text-text-primary transition-colors"
          >
            SEARCH
          </Link>
        </div>
      </div>
    </div>
  );
}
