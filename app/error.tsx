"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("VELOR Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="w-full max-w-md mx-auto border border-border-subtle bg-surface-1/40 p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <div className="h-10 w-10 flex items-center justify-center border border-danger/30 bg-danger/10 text-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <span className="font-mono text-[0.65rem] tracking-[0.25em] text-danger uppercase block mb-2">
          SYSTEM FAULT DETECTED
        </span>
        <h2 className="font-display text-xl font-medium tracking-tight text-text-primary mb-3">
          COMMAND CENTER INTERRUPTED
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mb-6 font-body">
          An unexpected anomaly occurred while processing sports telemetry. You can attempt to re-establish the connection.
        </p>

        {error.digest && (
          <p className="font-mono text-[0.65rem] text-text-secondary/60 mb-6 tracking-widest uppercase">
            DIGEST: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-text-primary text-background font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RETRY SIGNAL
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-border-default text-text-secondary font-mono text-xs tracking-widest hover:text-text-primary hover:border-text-secondary transition-colors"
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
