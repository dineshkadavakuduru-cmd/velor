"use client";

import { useRouter } from "next/navigation";

export default function RetryButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="px-4 py-2 bg-text-primary text-background font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
    >
      RETRY
    </button>
  );
}
