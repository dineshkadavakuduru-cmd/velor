"use client";

import { useEffect, useRef } from "react";
import { runIntro } from "@/animations/anime/intro";

export default function IntroClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = runIntro(rootRef.current);
    return () => {
      ctx?.revert?.();
    };
  }, []);

  return <div ref={rootRef} style={{ opacity: 0 }}>{children}</div>;
}
