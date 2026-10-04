"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("VELOR Root Layout Error:", error);
  }, [error]);

  return (
    <html lang="en" className="bg-[#05070B] text-[#F5F7FA]">
      <body className="min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center border border-[#101722] bg-[#0A0F17] p-8">
          <span className="font-mono text-xs tracking-[0.25em] text-[#FF4567] uppercase block mb-2">
            CRITICAL FAULT
          </span>
          <h1 className="text-xl font-medium tracking-tight mb-2 text-[#F5F7FA]">
            COMMAND CENTER OFFLINE
          </h1>
          <p className="text-sm text-[#8993A4] mb-6">
            A root-level system interruption occurred. Please re-initialize the application shell.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#F5F7FA] text-[#05070B] text-xs font-mono tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            RELOAD COMMAND CENTER
          </button>
        </div>
      </body>
    </html>
  );
}
